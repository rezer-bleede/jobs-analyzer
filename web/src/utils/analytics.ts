import type { Job } from '../types/job'

export interface CompanyActivity {
  company: string
  count: number
}

export interface LocationActivity {
  location: string
  count: number
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
