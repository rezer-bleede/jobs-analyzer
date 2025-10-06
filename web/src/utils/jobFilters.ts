import { Job, JobFilters } from '../types/job'

export const defaultFilters: JobFilters = {
  searchTerm: '',
  location: 'All locations',
  jobType: 'All job types',
  remoteOnly: false,
}

const matchesSearch = (job: Job, term: string): boolean => {
  if (!term) {
    return true
  }

  const haystack = [
    job.title,
    job.company,
    job.location,
    job.jobType ?? '',
    job.techSkills.join(' '),
    job.softSkills.join(' '),
    job.domainSkills.join(' '),
    job.summary ?? '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(term)
}

const matchesLocation = (job: Job, location: string): boolean => {
  if (!location || location === defaultFilters.location) {
    return true
  }

  const target = location.toLowerCase()
  return [job.country, job.location, job.state, job.city]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(target))
}

const matchesJobType = (job: Job, jobType: string): boolean => {
  if (!jobType || jobType === defaultFilters.jobType) {
    return true
  }

  const normalisedType = jobType.toLowerCase()
  return (job.jobType ?? '').toLowerCase().includes(normalisedType)
}

const matchesRemote = (job: Job, remoteOnly: boolean): boolean => {
  if (!remoteOnly) {
    return true
  }

  return job.isRemote === true
}

export const applyFilters = (jobs: Job[], filters: JobFilters): Job[] => {
  const searchTerm = filters.searchTerm.trim().toLowerCase()
  return jobs.filter(
    (job) =>
      matchesSearch(job, searchTerm) &&
      matchesLocation(job, filters.location) &&
      matchesJobType(job, filters.jobType) &&
      matchesRemote(job, filters.remoteOnly),
  )
}

export const deriveLocationOptions = (jobs: Job[]): string[] => {
  const options = new Set<string>()
  jobs.forEach((job) => {
    if (job.country) {
      options.add(job.country)
    } else if (job.location) {
      options.add(job.location)
    }
  })

  return [defaultFilters.location, ...Array.from(options).sort((a, b) => a.localeCompare(b))]
}

export const deriveJobTypeOptions = (jobs: Job[]): string[] => {
  const options = new Set<string>()
  jobs.forEach((job) => {
    if (job.jobType) {
      options.add(job.jobType)
    }
  })

  return [defaultFilters.jobType, ...Array.from(options).sort((a, b) => a.localeCompare(b))]
}
