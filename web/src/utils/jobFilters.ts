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
  // UAE
  'uae': 'United Arab Emirates',
  'u.a.e': 'United Arab Emirates',
  'u.a.e.': 'United Arab Emirates',
  'united arab emirates': 'United Arab Emirates',
  'dubai': 'United Arab Emirates',
  'abu dhabi': 'United Arab Emirates',
  'sharjah': 'United Arab Emirates',
  'ajman': 'United Arab Emirates',
  'fujairah': 'United Arab Emirates',
  'ras al khaimah': 'United Arab Emirates',
  'ras al-khaimah': 'United Arab Emirates',
  'umm al quwain': 'United Arab Emirates',
  'umm al-quwain': 'United Arab Emirates',
  // Saudi Arabia
  'saudi': 'Saudi Arabia',
  'saudi arabia': 'Saudi Arabia',
  'ksa': 'Saudi Arabia',
  'kingdom of saudi arabia': 'Saudi Arabia',
  // Qatar
  'qatar': 'Qatar',
  'state of qatar': 'Qatar',
  // Kuwait
  'kuwait': 'Kuwait',
  'state of kuwait': 'Kuwait',
  // Bahrain
  'bahrain': 'Bahrain',
  'kingdom of bahrain': 'Bahrain',
  // Oman
  'oman': 'Oman',
  'sultanate of oman': 'Oman',
  // Other Middle East / common in dataset
  'egypt': 'Egypt',
  'jordan': 'Jordan',
  'lebanon': 'Lebanon',
  'iraq': 'Iraq',
  'iran': 'Iran',
  'turkey': 'Turkey',
  'türkiye': 'Turkey',
  'pakistan': 'Pakistan',
  'india': 'India',
  'yemen': 'Yemen',
  'syria': 'Syria',
  'palestine': 'Palestine',
  'israel': 'Israel',
  'morocco': 'Morocco',
  'tunisia': 'Tunisia',
  'algeria': 'Algeria',
  'libya': 'Libya',
  'sudan': 'Sudan',
  'united states': 'United States',
  'usa': 'United States',
  'united kingdom': 'United Kingdom',
  'uk': 'United Kingdom',
  'germany': 'Germany',
  'france': 'France',
  'canada': 'Canada',
  'australia': 'Australia',
  'singapore': 'Singapore',
  'malaysia': 'Malaysia',
  'philippines': 'Philippines',
  'south africa': 'South Africa',
  'nigeria': 'Nigeria',
  'kenya': 'Kenya',
  'ghana': 'Ghana',
}

export const normalizeCountry = (country: string | undefined): string | null => {
  if (!country) return null
  const trimmed = country.trim()
  if (!trimmed) return null
  const lower = trimmed.toLowerCase()
  return COUNTRY_ALIASES[lower] ?? trimmed
}

/**
 * Try to extract a country name from a full location string like
 * "Dubai, Dubai, United Arab Emirates" by taking the last comma-separated
 * segment and normalizing it.
 */
export const extractCountryFromLocation = (location: string | undefined | null): string | null => {
  if (!location) return null
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return null

  // Try last segment first (most likely to be country)
  const lastPart = parts[parts.length - 1]
  const normalized = normalizeCountry(lastPart)
  if (normalized && COUNTRY_ALIASES[lastPart.toLowerCase()]) return normalized

  // Try second-to-last if last segment didn't match a known alias
  if (parts.length >= 2) {
    const secondLast = parts[parts.length - 2]
    const normalized2 = normalizeCountry(secondLast)
    if (normalized2 && COUNTRY_ALIASES[secondLast.toLowerCase()]) return normalized2
  }

  // If last segment looks like a country (not a city/state — heuristic:
  // known alias map didn't match but the full location has 3+ parts,
  // last part is likely still the country)
  if (parts.length >= 2) {
    return normalizeCountry(lastPart)
  }

  return null
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
