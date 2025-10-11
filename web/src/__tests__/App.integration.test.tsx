import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

describe('App integration', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  const originalJobsUrl = import.meta.env.VITE_JOBS_DATA_URL

  beforeEach(() => {
    vi.resetAllMocks()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    ;(import.meta.env as Record<string, string>).VITE_JOBS_DATA_URL = 'https://example.com/jobs.json'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (originalJobsUrl === undefined) {
      delete (import.meta.env as Record<string, string | undefined>).VITE_JOBS_DATA_URL
    } else {
      ;(import.meta.env as Record<string, string>).VITE_JOBS_DATA_URL = originalJobsUrl
    }
  })

  it('renders fetched jobs and derived metrics', async () => {
    const payload = [
      {
        job_hash: 'job-123',
        title: 'Lead Analytics Engineer',
        company: 'Insight Labs',
        location: 'Doha, Qatar',
        job_type: 'Full-time',
        is_remote: false,
        desired_tech_skills_inferred: 'dbt, Snowflake',
      },
    ]

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => payload,
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Lead Analytics Engineer')).toBeInTheDocument()
    })

    expect(screen.getByText('Insight Labs')).toBeInTheDocument()
    expect(screen.getByText('Showing 1 roles')).toBeInTheDocument()
    expect(screen.getAllByText('Doha, Qatar')[0]).toBeInTheDocument()
  })

  it('displays an informative error message when fetching jobs fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network unavailable'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('We couldn’t load the latest opportunities')
      expect(screen.getByRole('alert')).toHaveTextContent('Network unavailable')
    })
  })
})
