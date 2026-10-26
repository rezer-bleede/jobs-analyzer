import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { ThemeProvider } from '../hooks/useTheme'

const mockJobsPayload = [
  {
    job_hash: 167188749,
    site: 'LinkedIn',
    title: 'Senior Data Engineer',
    company: 'DLytica',
    location: 'Riyadh, Riyadh, Saudi Arabia',
    country_inferred: 'Saudi Arabia',
    job_type: 'Full-time',
    date_posted: '2025-10-04T00:00:00',
    is_remote: 'yes',
    desired_tech_skills_inferred: 'Python, Apache Spark, Kafka',
    job_description_inferred: 'Lead the development of large-scale data pipelines.',
  },
  {
    job_hash: 167188750,
    site: 'LinkedIn',
    title: 'Data Platform Engineer',
    company: 'CloudScale',
    location: 'Dubai, United Arab Emirates',
    country_inferred: 'United Arab Emirates',
    job_type: 'Contract',
    date_posted: '2025-10-01T00:00:00',
    is_remote: 'no',
    desired_tech_skills_inferred: 'Snowflake, dbt, SQL',
    job_description_inferred: 'Design resilient data platforms in the cloud.',
  },
]

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    const now = new Date()
    mockJobsPayload[0].date_posted = now.toISOString()
    mockJobsPayload[1].date_posted = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    vi.stubEnv('VITE_JOBS_DATA_URL', 'https://example.com/jobs.json')
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockJobsPayload),
        }) as unknown as Response,
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('presents a dense overview with quick access to analytics and results', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    )

    expect(await screen.findByRole('link', { name: /jump to results/i })).toHaveAttribute('href', '#job-results')
    expect(await screen.findByRole('link', { name: /view analytics/i })).toHaveAttribute('href', '/analytics')
    expect(screen.getByRole('link', { name: /custom analytics/i })).toHaveAttribute('href', '/custom-analytics')
  })

  it('renders job cards after fetching data', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    )

    await waitFor(() => expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument())
    expect(screen.getByText('Data Platform Engineer')).toBeInTheDocument()
    expect(screen.getByText(/showing 2 roles/i)).toBeInTheDocument()
  })

  it('paginates job cards so only one page is rendered at a time', async () => {
    const jobs = Array.from({ length: 45 }, (_, index) => ({
      ...mockJobsPayload[0],
      job_hash: `job-${index}`,
      title: `Data Engineer ${index + 1}`,
    }))
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => jobs,
    } as Response)

    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    )

    expect(await screen.findByText('Data Engineer 1')).toBeInTheDocument()
    expect(screen.getByText('Data Engineer 20')).toBeInTheDocument()
    expect(screen.queryByText('Data Engineer 21')).not.toBeInTheDocument()
    expect(screen.getByText(/showing 1–20 of 45 roles/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText('Data Engineer 21')).toBeInTheDocument()
    expect(screen.getByText('Data Engineer 40')).toBeInTheDocument()
    expect(screen.queryByText('Data Engineer 1')).not.toBeInTheDocument()
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
  })

  it('filters jobs based on the search input', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    )
    await waitFor(() => expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument())

    const searchInput = screen.getByLabelText(/search roles or companies/i)
    await userEvent.type(searchInput, 'platform{enter}')

    expect(await screen.findByText(/showing 1 role/i)).toBeInTheDocument()
    expect(screen.queryByText('Senior Data Engineer')).not.toBeInTheDocument()
  })

  it('supports filtering by posting date', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    )
    await waitFor(() => expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument())

    const dateSelect = screen.getByLabelText(/date posted/i)
    await userEvent.selectOptions(dateSelect, 'Past 3 days')

    expect(await screen.findByText(/showing 1 role/i)).toBeInTheDocument()
    expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument()
    expect(screen.queryByText('Data Platform Engineer')).not.toBeInTheDocument()
  })
})
