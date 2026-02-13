import type { Job, JobFilters } from '../types/job'

export const DATE_POSTED_OPTIONS = [
  'Any time',
  'Past 24 hours',
  'Past 3 days',
  'Past week',
  'Past 2 weeks',
] as const

const dateWindowInDays: Record<string, number> = {
  'Past 24 hours': 1,
  'Past 3 days': 3,
  'Past week': 7,
  'Past 2 weeks': 14,
}

export const defaultFilters: JobFilters = {
  searchTerms: [],
  location: 'All locations',
  datePosted: DATE_POSTED_OPTIONS[0],
  countries: [],
}

const matchesSearch = (job: Job, terms: string[]): boolean => {
  if (!terms.length) {
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

  return terms.every((term) => haystack.includes(term.toLowerCase()))
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

const matchesCountries = (job: Job, countries: string[]): boolean => {
  if (!countries.length) {
    return true
  }

  const jobCountry = job.country?.toLowerCase() ?? ''
  const jobLocation = job.location?.toLowerCase() ?? ''
  
  return countries.some((country) => {
    const target = country.toLowerCase()
    return jobCountry.includes(target) || jobLocation.includes(target)
  })
}

const matchesDatePosted = (job: Job, dateFilter: string): boolean => {
  if (!dateFilter || dateFilter === defaultFilters.datePosted) {
    return true
  }

  const days = dateWindowInDays[dateFilter]
  if (!days) {
    return true
  }

  if (!job.postingDate) {
    return false
  }

  const postingDate = new Date(job.postingDate)
  if (Number.isNaN(postingDate.getTime())) {
    return false
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return postingDate >= windowStart
}

export const applyFilters = (jobs: Job[], filters: JobFilters): Job[] => {
  return jobs.filter(
    (job) =>
      matchesSearch(job, filters.searchTerms) &&
      matchesLocation(job, filters.location) &&
      matchesCountries(job, filters.countries) &&
      matchesDatePosted(job, filters.datePosted),
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

export const deriveCountryOptions = (jobs: Job[]): string[] => {
  const options = new Set<string>()
  jobs.forEach((job) => {
    if (job.country) {
      options.add(job.country)
    }
  })

  return Array.from(options).sort((a, b) => a.localeCompare(b))
}

export const deriveSearchOptions = (jobs: Job[]): string[] => {
  const options = new Set<string>()

  jobs.forEach((job) => {
    ;[
      job.title,
      job.company,
      job.location,
      job.jobType ?? undefined,
      job.industry ?? undefined,
    ]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .forEach((value) => options.add(value.trim()))

    job.techSkills.forEach((skill) => options.add(skill))
    job.softSkills.forEach((skill) => options.add(skill))
    job.domainSkills.forEach((skill) => options.add(skill))
  })

  return Array.from(options).sort((a, b) => a.localeCompare(b))
}
