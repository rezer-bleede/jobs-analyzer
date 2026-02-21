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

  it('handles new metadata wrapper format', () => {
    const payload = {
      metadata: {
        lastUpdated: '2026-01-01T00:00:00Z',
        totalJobs: 1,
        source: 'Test',
        version: '1.0.0',
        dataFreshness: 'live',
      },
      jobs: [
        {
          job_hash: 'job-1',
          title: 'Test Engineer',
          company: 'Test Co',
          location: 'Dubai, UAE',
        },
      ],
    }

    const result = normaliseJobs(payload)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'job-1',
      title: 'Test Engineer',
      company: 'Test Co',
    })
  })
})

describe('fetchJobs', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
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
    expect(result.jobs).toHaveLength(1)
    expect(result.jobs[0]).toMatchObject({
      id: 'job-1',
      title: 'Staff Data Engineer',
      company: 'Data Corp',
      location: 'Riyadh, Saudi Arabia',
    })
    expect(result.metadata).toBeNull()
  })

  it('retrieves jobs with metadata from new format', async () => {
    const payload = {
      metadata: {
        lastUpdated: '2026-01-01T00:00:00Z',
        totalJobs: 1,
        source: 'Test Source',
        version: '1.0.0',
        dataFreshness: 'live',
      },
      jobs: [
        {
          job_hash: 'job-meta',
          title: 'Meta Engineer',
          company: 'Meta Corp',
          location: 'Dubai, UAE',
        },
      ],
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    })

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchJobs('https://example.com/jobs.json')

    expect(result.jobs).toHaveLength(1)
    expect(result.metadata).toMatchObject({
      lastUpdated: '2026-01-01T00:00:00Z',
      totalJobs: 1,
      source: 'Test Source',
    })
  })

  it('falls back to the default jobs file when the primary URL fails (e.g. due to CORS)', async () => {
    const fallbackPayload = [
      {
        job_hash: 'job-2',
        title: 'Platform Data Engineer',
        company: 'Camel Cloud',
        location: 'Jeddah, Saudi Arabia',
      },
    ]

    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => fallbackPayload,
      })

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchJobs('https://example.com/jobs.json')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://example.com/jobs.json')
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/jobs.json')
    expect(result.jobs).toHaveLength(1)
    expect(result.jobs[0]).toMatchObject({
      id: 'job-2',
      title: 'Platform Data Engineer',
      company: 'Camel Cloud',
    })
  })

  it('throws a detailed error when both primary and fallback sources fail', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new Error('Not found'))

    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchJobs('https://example.com/jobs.json')).rejects.toThrow(
      /Unable to load jobs data\. Primary source https:\/\/example\.com\/jobs\.json failed: Failed to fetch \(the server at https:\/\/example\.com\/jobs\.json may be blocking cross-origin requests\) Fallback source \/jobs\.json failed: Not found/,
    )
  })

  it('uses the fallback when the primary URL is missing', async () => {
    const fallbackPayload = [
      {
        job_hash: 'job-3',
        title: 'Data Reliability Engineer',
        company: 'Oasis Analytics',
        location: 'Manama, Bahrain',
      },
    ]

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fallbackPayload,
    })

    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchJobs('', '/jobs.json')

    expect(fetchMock).toHaveBeenCalledWith('/jobs.json')
    expect(result.jobs[0]).toMatchObject({
      title: 'Data Reliability Engineer',
      company: 'Oasis Analytics',
    })
  })
})
