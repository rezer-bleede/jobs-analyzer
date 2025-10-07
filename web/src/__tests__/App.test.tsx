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

    expect(
      await screen.findByText(/live metrics summarise total, remote, and company coverage/i),
    ).toBeInTheDocument()
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

    const searchInput = screen.getByPlaceholderText(/search by title/i)
    await userEvent.clear(searchInput)
    await userEvent.type(searchInput, 'platform')

    expect(await screen.findByText(/showing 1 role/i)).toBeInTheDocument()
    expect(screen.queryByText('Senior Data Engineer')).not.toBeInTheDocument()
  })

  it('supports remote-only filtering', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument())

    const remoteToggle = screen.getByLabelText(/remote only/i)
    await userEvent.click(remoteToggle)

    expect(await screen.findByText(/showing 1 role/i)).toBeInTheDocument()
    expect(screen.getByText('Senior Data Engineer')).toBeInTheDocument()
    expect(screen.queryByText('Data Platform Engineer')).not.toBeInTheDocument()
  })
})
