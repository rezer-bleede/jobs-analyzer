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
  // UAE — names, abbreviations, ISO code, cities, emirates
  'ae': 'United Arab Emirates',
  'uae': 'United Arab Emirates',
  'uaen': 'United Arab Emirates',
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
  'sa': 'Saudi Arabia',
  'saudi': 'Saudi Arabia',
  'saudi arabia': 'Saudi Arabia',
  'ksa': 'Saudi Arabia',
  'kingdom of saudi arabia': 'Saudi Arabia',
  // Qatar
  'qa': 'Qatar',
  'qatar': 'Qatar',
  'state of qatar': 'Qatar',
  // Kuwait
  'kw': 'Kuwait',
  'kuwait': 'Kuwait',
  'state of kuwait': 'Kuwait',
  // Bahrain
  'bh': 'Bahrain',
  'bahrain': 'Bahrain',
  'kingdom of bahrain': 'Bahrain',
  // Oman
  'om': 'Oman',
  'oman': 'Oman',
  'sultanate of oman': 'Oman',
  // Other Middle East
  'eg': 'Egypt',
  'egypt': 'Egypt',
  'jo': 'Jordan',
  'jordan': 'Jordan',
  'lb': 'Lebanon',
  'lebanon': 'Lebanon',
  'iq': 'Iraq',
  'iraq': 'Iraq',
  'ir': 'Iran',
  'iran': 'Iran',
  'tr': 'Turkey',
  'turkey': 'Turkey',
  'türkiye': 'Turkey',
  'pk': 'Pakistan',
  'pakistan': 'Pakistan',
  'in': 'India',
  'india': 'India',
  'ye': 'Yemen',
  'yemen': 'Yemen',
  'sy': 'Syria',
  'syria': 'Syria',
  'ps': 'Palestine',
  'palestine': 'Palestine',
  'il': 'Israel',
  'israel': 'Israel',
  'ma': 'Morocco',
  'morocco': 'Morocco',
  'tn': 'Tunisia',
  'tunisia': 'Tunisia',
  'dz': 'Algeria',
  'algeria': 'Algeria',
  'ly': 'Libya',
  'libya': 'Libya',
  'sd': 'Sudan',
  'sudan': 'Sudan',
  // International
  'us': 'United States',
  'usa': 'United States',
  'united states': 'United States',
  'gb': 'United Kingdom',
  'uk': 'United Kingdom',
  'united kingdom': 'United Kingdom',
  'de': 'Germany',
  'germany': 'Germany',
  'fr': 'France',
  'france': 'France',
  'ca': 'Canada',
  'canada': 'Canada',
  'au': 'Australia',
  'australia': 'Australia',
  'sg': 'Singapore',
  'singapore': 'Singapore',
  'my': 'Malaysia',
  'malaysia': 'Malaysia',
  'ph': 'Philippines',
  'philippines': 'Philippines',
  'za': 'South Africa',
  'south africa': 'South Africa',
  'ng': 'Nigeria',
  'nigeria': 'Nigeria',
  'ke': 'Kenya',
  'kenya': 'Kenya',
  'gh': 'Ghana',
  'ghana': 'Ghana',
  'ch': 'Switzerland',
  'switzerland': 'Switzerland',
  'pl': 'Poland',
  'poland': 'Poland',
  'es': 'Spain',
  'spain': 'Spain',
  'pt': 'Portugal',
  'portugal': 'Portugal',
}

/** Non-country strings that appear in country fields and should be ignored. */
const COUNTRY_JUNK = new Set([
  'none', 'n/a', 'na', 'null', 'undefined', '-', 'remote', 'global',
  'worldwide', 'international', 'middle east', 'gcc', 'mena', 'apac',
  'emea', 'latam', 'europe', 'asia', 'africa', 'americas',
])

/**
 * Resolve a raw country string to a standardized name.
 * - Matches against known aliases and ISO-2 codes
 * - Rejects known junk/region strings (returns null)
 * - For multi-country comma strings, returns the first recognized country
 * - Returns trimmed input for unrecognised but plausible single-country values
 */
export const normalizeCountry = (country: string | undefined | null): string | null => {
  if (!country) return null
  const trimmed = country.trim()
  if (!trimmed) return null
  const lower = trimmed.toLowerCase()

  // Direct alias hit
  if (COUNTRY_ALIASES[lower]) return COUNTRY_ALIASES[lower]

  // Known junk — drop
  if (COUNTRY_JUNK.has(lower)) return null

  // Multi-value string (e.g. "UK, UAE, Poland") — scan each part for first alias hit
  if (trimmed.includes(',')) {
    for (const part of trimmed.split(',').map((p) => p.trim())) {
      const alias = COUNTRY_ALIASES[part.toLowerCase()]
      if (alias) return alias
    }
    return null
  }

  // Single unrecognised value — keep as-is (e.g. "Switzerland")
  return trimmed
}

/**
 * Extract a standardized country from a full location string such as
 * "Dubai, Dubai, United Arab Emirates" by scanning segments right-to-left
 * for a known alias. Only returns alias-matched values (no free-form pass-through)
 * to avoid promoting city/state names to countries.
 */
export const extractCountryFromLocation = (location: string | undefined | null): string | null => {
  if (!location) return null
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return null

  // Scan right-to-left — rightmost segment is most likely the country
  for (let i = parts.length - 1; i >= 0; i--) {
    const alias = COUNTRY_ALIASES[parts[i].toLowerCase()]
    if (alias) return alias
  }

  // No alias match found — if there are 2+ segments, the last part may still
  // be a valid country not in our alias map (e.g. an unusual country).
  // Keep it only if normalizeCountry doesn't classify it as junk.
  if (parts.length >= 2) {
    return normalizeCountry(parts[parts.length - 1])
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

export const buildJobSearchIndex = (jobs: Job[]): WeakMap<Job, string> => {
  const index = new WeakMap<Job, string>()
  jobs.forEach((job) => index.set(job, [job.title, job.company, job.location, job.jobType ?? '', job.techSkills.join(' '), job.softSkills.join(' '), job.domainSkills.join(' '), job.summary ?? ''].join(' ').toLowerCase()))
  return index
}

const matchesSearch = (job: Job, terms: string[], searchIndex?: WeakMap<Job, string>): boolean => {
  if (!terms.length) {
    return true
  }

  const haystack = searchIndex?.get(job) ?? [
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

export const applyFilters = (jobs: Job[], filters: JobFilters, searchIndex?: WeakMap<Job, string>): Job[] => {
  return jobs.filter(
    (job) =>
      matchesSearch(job, filters.searchTerms, searchIndex) &&
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
