import type { Job, JobFilters } from '../types/job'

export const STANDARDIZED_COUNTRIES = [
  'Saudi Arabia',
  'United Arab Emirates',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
] as const

const COUNTRY_ALIASES: Record<string, string> = {
  'uae': 'United Arab Emirates',
  'u.a.e': 'United Arab Emirates',
  'united arab emirates': 'United Arab Emirates',
  'dubai': 'United Arab Emirates',
  'abu dhabi': 'United Arab Emirates',
  'saudi': 'Saudi Arabia',
  'saudi arabia': 'Saudi Arabia',
  'ksa': 'Saudi Arabia',
  'qatar': 'Qatar',
  'kuwait': 'Kuwait',
  'bahrain': 'Bahrain',
  'oman': 'Oman',
}

export const normalizeCountry = (country: string | undefined): string | null => {
  if (!country) return null
  const normalized = country.trim().toLowerCase()
  return COUNTRY_ALIASES[normalized] ?? null
}

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
  const foundCountries = new Set<string>()
  
  jobs.forEach((job) => {
    if (job.country) {
      const normalized = normalizeCountry(job.country)
      if (normalized) {
        foundCountries.add(normalized)
      } else {
        foundCountries.add(job.country)
      }
    }
  })

  const sortedCountries = Array.from(foundCountries).sort((a, b) => a.localeCompare(b))
  return sortedCountries.length > 0 ? sortedCountries : [...STANDARDIZED_COUNTRIES]
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
