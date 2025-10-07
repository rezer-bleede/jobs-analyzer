import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

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
    const now = new Date()
    mockJobsPayload[0].date_posted = now.toISOString()
    mockJobsPayload[1].date_posted = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    vi.stubEnv('VITE_JOBS_DATA_URL', 'https://example.com/jobs.json')
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockJobsPayload),
      }) as unknown as Response,
    ))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('shows a focused hero message with a call to action', async () => {
    render(<App />)

    expect(
      await screen.findByRole('link', {
        name: /browse open roles/i,
      }),
    ).toHaveAttribute('href', '#job-results')

    expect(await screen.findByRole('link', { name: /view market analytics/i })).toHaveAttribute(
      'href',
      '/analytics',
    )
    expect(await screen.findByText(/multi-select search and posting date filters/i)).toBeInTheDocument()
  })

  it('renders job cards after fetching data', async () => {
    render(<App />)

    await waitFor(() => expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument())
    expect(screen.getByText('Data Platform Engineer')).toBeInTheDocument()
    expect(screen.getByText(/showing 2 roles/i)).toBeInTheDocument()
  })

  it('filters jobs based on the search input', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument())

    const searchInput = screen.getByLabelText(/search roles or companies/i)
    await userEvent.type(searchInput, 'platform{enter}')

    expect(await screen.findByText(/showing 1 role/i)).toBeInTheDocument()
    expect(screen.queryByText('Senior Data Engineer')).not.toBeInTheDocument()
  })

  it('supports filtering by posting date', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument())

    const dateSelect = screen.getByLabelText(/date posted/i)
    await userEvent.selectOptions(dateSelect, 'Past 3 days')

    expect(await screen.findByText(/showing 1 role/i)).toBeInTheDocument()
    expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument()
    expect(screen.queryByText('Data Platform Engineer')).not.toBeInTheDocument()
  })
})
