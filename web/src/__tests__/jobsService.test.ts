import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchJobs, normaliseJobs } from '../services/jobsService'

describe('normaliseJobs', () => {
  it('returns an empty array when payload is nullish', () => {
    expect(normaliseJobs(undefined)).toEqual([])
    expect(normaliseJobs(null)).toEqual([])
  })

  it('normalises raw job entries into the expected structure', () => {
    const result = normaliseJobs([
      {
        job_hash: 'abc123',
        title: 'Principal Data Engineer',
        company: 'Cloud Analytics',
        location: 'Dubai, United Arab Emirates',
        job_type: 'Full-time',
        date_posted: '2025-01-01',
        is_remote: 'true',
        desired_tech_skills_inferred: 'Python, Spark, Airflow',
        desired_domain_skills_inferred: 'Data Warehousing',
        desired_soft_skills_inferred: 'Communication',
      },
    ])

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'abc123',
      title: 'Principal Data Engineer',
      company: 'Cloud Analytics',
      jobType: 'Full-time',
      postingDate: '2025-01-01',
      isRemote: true,
      techSkills: ['Python', 'Spark', 'Airflow'],
      domainSkills: ['Data Warehousing'],
      softSkills: ['Communication'],
    })
  })
})

describe('fetchJobs', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('retrieves and normalises jobs from the provided URL', async () => {
    const payload = [
      {
        job_hash: 'job-1',
        title: 'Staff Data Engineer',
        company: 'Data Corp',
        location: 'Riyadh, Saudi Arabia',
      },
    ]

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    })

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchJobs('https://example.com/jobs.json')

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/jobs.json')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'job-1',
      title: 'Staff Data Engineer',
      company: 'Data Corp',
      location: 'Riyadh, Saudi Arabia',
    })
  })

  it('throws a helpful error when fetch returns a non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchJobs('https://example.com/jobs.json')).rejects.toThrow(
      'Unable to fetch jobs data (status 500)',
    )
  })

  it('throws when the jobs URL is missing', async () => {
    await expect(fetchJobs('')).rejects.toThrow(
      'Jobs data URL is not configured. Set VITE_JOBS_DATA_URL in your environment.',
    )
  })
})
