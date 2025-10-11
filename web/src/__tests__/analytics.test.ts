import { describe, expect, it } from 'vitest'
import type { Job } from '../types/job'
import {
  buildIndustryBreakdown,
  buildLocationRemoteStats,
  buildPostingTrends,
  buildRemoteSplit,
  buildSalaryBenchmarks,
} from '../utils/analytics'

const baseJob: Job = {
  id: '1',
  title: 'Data Engineer',
  company: 'Acme',
  location: 'Riyadh, Saudi Arabia',
  country: 'Saudi Arabia',
  jobType: 'Full-time',
  postingDate: '2025-01-06T00:00:00.000Z',
  source: 'LinkedIn',
  jobUrl: null,
  minSalary: null,
  maxSalary: null,
  currency: null,
  isRemote: null,
  techSkills: [],
  softSkills: [],
  domainSkills: [],
  raw: {},
}

describe('analytics helpers', () => {
  it('builds posting trends grouped by week with remote counts', () => {
    const jobs: Job[] = [
      { ...baseJob, id: '1', postingDate: '2025-01-01T00:00:00Z', isRemote: true },
      { ...baseJob, id: '2', postingDate: '2025-01-03T00:00:00Z', isRemote: false },
      { ...baseJob, id: '3', postingDate: '2025-01-10T00:00:00Z', isRemote: true },
      { ...baseJob, id: '4', postingDate: '2025-01-11T00:00:00Z', isRemote: null },
    ]

    const trends = buildPostingTrends(jobs, 4)
    expect(trends).toHaveLength(2)
    expect(trends[0].total).toBe(2)
    expect(trends[0].remote).toBe(1)
    expect(trends[1].total).toBe(2)
    expect(trends[1].remote).toBe(1)
  })

  it('calculates remote split across remote, on-site and unspecified roles', () => {
    const jobs: Job[] = [
      { ...baseJob, id: '1', isRemote: true },
      { ...baseJob, id: '2', isRemote: false },
      { ...baseJob, id: '3', isRemote: null },
    ]

    const split = buildRemoteSplit(jobs)
    expect(split).toEqual([
      { label: 'Remote', count: 1 },
      { label: 'On-site', count: 1 },
      { label: 'Unspecified', count: 1 },
    ])
  })

  it('produces salary benchmarks grouped by currency', () => {
    const jobs: Job[] = [
      { ...baseJob, id: '1', currency: 'USD', minSalary: 90000, maxSalary: 110000 },
      { ...baseJob, id: '2', currency: 'USD', minSalary: 95000, maxSalary: 120000 },
      { ...baseJob, id: '3', currency: 'AED', minSalary: 300000, maxSalary: 360000 },
    ]

    const benchmarks = buildSalaryBenchmarks(jobs)
    expect(benchmarks).toHaveLength(2)
    const usd = benchmarks.find((item) => item.currency === 'USD')
    expect(usd).toBeDefined()
    expect(usd?.roles).toBe(2)
    expect(Math.round(usd?.average ?? 0)).toBe(103750)
    expect(usd?.minimum).toBe(90000)
    expect(usd?.maximum).toBe(120000)
  })

  it('summarises industry breakdown with remote share', () => {
    const jobs: Job[] = [
      { ...baseJob, id: '1', industry: 'Energy', isRemote: true },
      { ...baseJob, id: '2', industry: 'Energy', isRemote: false },
      { ...baseJob, id: '3', industry: 'Finance', isRemote: false },
    ]

    const breakdown = buildIndustryBreakdown(jobs)
    const energy = breakdown.find((item) => item.industry === 'Energy')
    expect(energy).toBeDefined()
    expect(energy?.roles).toBe(2)
    expect(energy?.remoteShare).toBeCloseTo(0.5)
  })

  it('calculates location remote stats with remote share percentages', () => {
    const jobs: Job[] = [
      { ...baseJob, id: '1', location: 'Dubai, UAE', country: 'United Arab Emirates', isRemote: true },
      { ...baseJob, id: '2', location: 'Dubai, UAE', country: 'United Arab Emirates', isRemote: false },
      { ...baseJob, id: '3', location: 'Dubai, UAE', country: 'United Arab Emirates', isRemote: null },
      { ...baseJob, id: '4', location: 'Riyadh, Saudi Arabia', country: 'Saudi Arabia', isRemote: false },
    ]

    const stats = buildLocationRemoteStats(jobs)
    const dubai = stats.find((item) => item.location === 'United Arab Emirates')
    expect(dubai).toBeDefined()
    expect(dubai?.total).toBe(3)
    expect(dubai?.remote).toBe(1)
    expect(dubai?.onsite).toBe(1)
    expect(dubai?.unknown).toBe(1)
    expect(dubai?.remoteShare).toBeCloseTo(1 / 3)
  })
})
