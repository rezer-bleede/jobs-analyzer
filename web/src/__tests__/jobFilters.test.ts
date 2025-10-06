import { describe, expect, it } from 'vitest'
import { Job, JobFilters } from '../types/job'
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

  it('filters by search term across multiple fields', () => {
    const jobs = [createJob({ id: '1' }), createJob({ id: '2', company: 'Cloud Analytics' })]
    const result = applyFilters(jobs, withFilters({ searchTerm: 'cloud' }))
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

  it('filters by job type case-insensitively', () => {
    const jobs = [createJob({ id: '1', jobType: 'Contract' }), createJob({ id: '2', jobType: 'Full-time' })]
    const result = applyFilters(jobs, withFilters({ jobType: 'contract' }))
    expect(result).toHaveLength(1)
    expect(result[0].jobType).toBe('Contract')
  })

  it('filters by remote only flag', () => {
    const jobs = [createJob({ id: '1', isRemote: true }), createJob({ id: '2', isRemote: false })]
    const result = applyFilters(jobs, withFilters({ remoteOnly: true }))
    expect(result).toHaveLength(1)
    expect(result[0].isRemote).toBe(true)
  })
})
