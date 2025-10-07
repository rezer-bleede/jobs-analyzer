import { describe, expect, it, vi } from 'vitest'
import type { Job, JobFilters } from '../types/job'
import { applyFilters, defaultFilters } from '../utils/jobFilters'

const createJob = (overrides: Partial<Job> = {}): Job => ({
  id: '1',
  title: 'Senior Data Engineer',
  company: 'Data Corp',
  location: 'Dubai, United Arab Emirates',
  country: 'United Arab Emirates',
  state: 'Dubai',
  city: 'Dubai',
  jobType: 'Full-time',
  postingDate: '2025-01-01',
  source: 'LinkedIn',
  jobUrl: 'https://example.com',
  minSalary: null,
  maxSalary: null,
  currency: null,
  isRemote: false,
  techSkills: ['Python', 'Spark'],
  softSkills: ['Communication'],
  domainSkills: ['Data Warehousing'],
  summary: 'Work on data pipelines',
  requirements: '7+ years of experience',
  responsibilities: 'Build ETL jobs',
  benefits: 'Hybrid work',
  industry: 'Technology',
  domains: 'Data & Analytics',
  raw: {},
  ...overrides,
})

const withFilters = (filters: Partial<JobFilters>) => ({
  ...defaultFilters,
  ...filters,
})

describe('applyFilters', () => {
  it('returns all jobs when filters are default', () => {
    const jobs = [createJob({ id: '1' }), createJob({ id: '2', title: 'Data Architect' })]
    const result = applyFilters(jobs, defaultFilters)
    expect(result).toHaveLength(2)
  })

  it('filters by multiple search terms across different fields', () => {
    const jobs = [
      createJob({ id: '1', company: 'Cloud Analytics', techSkills: ['Snowflake'] }),
      createJob({ id: '2', company: 'Data Works', techSkills: ['dbt', 'Fivetran'] }),
    ]
    const result = applyFilters(jobs, withFilters({ searchTerms: ['cloud', 'snowflake'] }))
    expect(result).toHaveLength(1)
    expect(result[0].company).toBe('Cloud Analytics')
  })

  it('filters by location', () => {
    const jobs = [
      createJob({ id: '1', country: 'United Arab Emirates' }),
      createJob({ id: '2', country: 'Saudi Arabia', location: 'Riyadh, Saudi Arabia' }),
    ]
    const result = applyFilters(jobs, withFilters({ location: 'Saudi Arabia' }))
    expect(result).toHaveLength(1)
    expect(result[0].country).toBe('Saudi Arabia')
  })

  it('filters by posting date window', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T00:00:00Z'))
    const jobs = [
      createJob({ id: '1', postingDate: '2025-01-14T00:00:00Z' }),
      createJob({ id: '2', postingDate: '2024-12-30T00:00:00Z' }),
    ]

    const result = applyFilters(jobs, withFilters({ datePosted: 'Past 3 days' }))

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
    vi.useRealTimers()
  })
})
