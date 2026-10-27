import type { Job } from '../types/job'

export const formatJobDate = (value?: string | null): string => {
  if (!value) return 'Date not provided'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Date not provided'
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatSalaryRange = (job: Job): string | null => {
  if (job.minSalary && job.maxSalary && job.currency) {
    return `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} ${job.currency}`
  }
  if (job.minSalary && job.currency) {
    return `From ${job.minSalary.toLocaleString()} ${job.currency}`
  }
  if (job.maxSalary && job.currency) {
    return `Up to ${job.maxSalary.toLocaleString()} ${job.currency}`
  }
  return null
}

export const formatRemote = (job: Job): string =>
  job.isRemote === true ? 'Remote' : job.isRemote === false ? 'On-site' : 'Hybrid'
