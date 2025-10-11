import type { Job } from '../types/job'

export interface CompanyActivity {
  company: string
  count: number
}

export interface LocationActivity {
  location: string
  count: number
}

export interface WeeklyTrendPoint {
  weekStart: string
  label: string
  total: number
  remote: number
}

export interface RemoteSplitSegment {
  label: string
  count: number
}

export interface SalaryBenchmark {
  currency: string
  roles: number
  average: number
  minimum: number
  maximum: number
}

export interface IndustryBreakdown {
  industry: string
  roles: number
  remoteShare: number
}

export interface LocationRemoteStat {
  location: string
  total: number
  remote: number
  onsite: number
  unknown: number
  remoteShare: number
}

const isWithinWindow = (job: Job, days: number): boolean => {
  if (!job.postingDate) {
    return false
  }

  const postingDate = new Date(job.postingDate)
  if (Number.isNaN(postingDate.getTime())) {
    return false
  }

  const now = new Date()
  const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return postingDate >= threshold
}

export const buildCompanyActivity = (jobs: Job[], days = 14): CompanyActivity[] => {
  const counts = new Map<string, number>()

  jobs.forEach((job) => {
    if (!job.company) {
      return
    }

    if (!isWithinWindow(job, days)) {
      return
    }

    const current = counts.get(job.company) ?? 0
    counts.set(job.company, current + 1)
  })

  return Array.from(counts.entries())
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count || a.company.localeCompare(b.company))
}

export const buildLocationActivity = (jobs: Job[], limit = 5): LocationActivity[] => {
  const counts = new Map<string, number>()

  jobs.forEach((job) => {
    const label = job.country ?? job.location
    if (!label) {
      return
    }

    const current = counts.get(label) ?? 0
    counts.set(label, current + 1)
  })

  return Array.from(counts.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location))
    .slice(0, limit)
}

const getWeekStart = (date: Date): Date => {
  const weekStart = new Date(date)
  const day = weekStart.getUTCDay() || 7
  if (day !== 1) {
    weekStart.setUTCDate(weekStart.getUTCDate() + 1 - day)
  }
  weekStart.setUTCHours(0, 0, 0, 0)
  return weekStart
}

export const buildPostingTrends = (jobs: Job[], weeks = 12): WeeklyTrendPoint[] => {
  const trend = new Map<string, { total: number; remote: number }>()

  jobs.forEach((job) => {
    if (!job.postingDate) {
      return
    }

    const parsed = new Date(job.postingDate)
    if (Number.isNaN(parsed.getTime())) {
      return
    }

    const weekStart = getWeekStart(parsed)
    const key = weekStart.toISOString()
    const current = trend.get(key) ?? { total: 0, remote: 0 }
    current.total += 1
    if (job.isRemote === true) {
      current.remote += 1
    }
    trend.set(key, current)
  })

  return Array.from(trend.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-weeks)
    .map(([weekStart, counts]) => ({
      weekStart,
      label: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(weekStart)),
      total: counts.total,
      remote: counts.remote,
    }))
}

export const buildRemoteSplit = (jobs: Job[]): RemoteSplitSegment[] => {
  let remote = 0
  let onsite = 0
  let unknown = 0

  jobs.forEach((job) => {
    if (job.isRemote === true) {
      remote += 1
    } else if (job.isRemote === false) {
      onsite += 1
    } else {
      unknown += 1
    }
  })

  return [
    { label: 'Remote', count: remote },
    { label: 'On-site', count: onsite },
    { label: 'Unspecified', count: unknown },
  ].filter((segment) => segment.count > 0)
}

export const buildSalaryBenchmarks = (jobs: Job[]): SalaryBenchmark[] => {
  const byCurrency = new Map<string, { values: number[]; min: number; max: number }>()

  jobs.forEach((job) => {
    if (!job.currency) {
      return
    }

    const hasMin = typeof job.minSalary === 'number'
    const hasMax = typeof job.maxSalary === 'number'

    if (!hasMin && !hasMax) {
      return
    }

    const midpoint = hasMin && hasMax ? (job.minSalary! + job.maxSalary!) / 2 : (job.minSalary ?? job.maxSalary ?? 0)
    const entry = byCurrency.get(job.currency) ?? { values: [], min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
    entry.values.push(midpoint)
    if (hasMin) {
      entry.min = Math.min(entry.min, job.minSalary!)
    }
    if (hasMax) {
      entry.max = Math.max(entry.max, job.maxSalary!)
    }
    byCurrency.set(job.currency, entry)
  })

  return Array.from(byCurrency.entries())
    .map(([currency, { values, min, max }]) => ({
      currency,
      roles: values.length,
      average: values.reduce((acc, value) => acc + value, 0) / values.length,
      minimum: Number.isFinite(min) ? min : 0,
      maximum: Number.isFinite(max) ? max : 0,
    }))
    .filter((item) => item.roles > 0)
    .sort((a, b) => b.roles - a.roles || a.currency.localeCompare(b.currency))
}

const cleanIndustryLabel = (job: Job): string | null => {
  if (job.industry) {
    return job.industry
  }

  if (job.domains) {
    return job.domains
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)[0] ?? null
  }

  return null
}

export const buildIndustryBreakdown = (jobs: Job[], limit = 8): IndustryBreakdown[] => {
  const buckets = new Map<string, { total: number; remote: number }>()

  jobs.forEach((job) => {
    const label = cleanIndustryLabel(job)
    if (!label) {
      return
    }

    const bucket = buckets.get(label) ?? { total: 0, remote: 0 }
    bucket.total += 1
    if (job.isRemote === true) {
      bucket.remote += 1
    }
    buckets.set(label, bucket)
  })

  return Array.from(buckets.entries())
    .map(([industry, { total, remote }]) => ({
      industry,
      roles: total,
      remoteShare: total > 0 ? remote / total : 0,
    }))
    .sort((a, b) => b.roles - a.roles || a.industry.localeCompare(b.industry))
    .slice(0, limit)
}

export const buildLocationRemoteStats = (jobs: Job[], limit = 8): LocationRemoteStat[] => {
  const stats = new Map<string, { total: number; remote: number; onsite: number; unknown: number }>()

  jobs.forEach((job) => {
    const label = job.country ?? job.location
    if (!label) {
      return
    }

    const entry = stats.get(label) ?? { total: 0, remote: 0, onsite: 0, unknown: 0 }
    entry.total += 1
    if (job.isRemote === true) {
      entry.remote += 1
    } else if (job.isRemote === false) {
      entry.onsite += 1
    } else {
      entry.unknown += 1
    }
    stats.set(label, entry)
  })

  return Array.from(stats.entries())
    .map(([location, { total, remote, onsite, unknown }]) => ({
      location,
      total,
      remote,
      onsite,
      unknown,
      remoteShare: total > 0 ? remote / total : 0,
    }))
    .sort((a, b) => b.total - a.total || a.location.localeCompare(b.location))
    .slice(0, limit)
}
