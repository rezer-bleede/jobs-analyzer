import type { Job } from '../types/job'
import { normalizeCountry, extractCountryFromLocation } from '../utils/jobFilters'
import { parseSkillList } from '../utils/skills'

export interface JobsData {
  metadata: {
    lastUpdated: string
    totalJobs: number
    source: string
    version: string
    dataFreshness: string
  }
  jobs: RawJob[]
}

type RawJob = Record<string, unknown>
const CACHE_FIELDS = [
  'job_hash', 'id', 'title', 'job_title_inferred', 'company', 'company_name_inferred', 'location',
  'country', 'country_inferred', 'state_inferred', 'city_inferred', 'job_type', 'job_type_inferred', 'date_posted',
  'min_amount', 'max_amount', 'currency', 'is_remote', 'site', 'job_url', 'job_url_direct',
  'company_url', 'company_website_inferred', 'company_description', 'company_description_inferred', 'description', 'job_description',
  'desired_tech_skills_inferred', 'tech_skills', 'desired_soft_skills_inferred', 'soft_skills',
  'desired_domain_skills_inferred', 'domain_skills', 'company_industry', 'company_industry_inferred',
  'domains_inferred', 'job_description_inferred', 'job_requirements_inferred',
  'job_responsibilities_inferred', 'job_benefits_inferred',
]

const compactPayload = (payload: unknown): unknown => {
  const compactRows = (rows: unknown[]) => rows.map((row) => {
    if (!row || typeof row !== 'object') return row
    const record = row as RawJob
    return Object.fromEntries(CACHE_FIELDS.filter((key) => key in record).map((key) => [key, record[key]]))
  })
  if (Array.isArray(payload)) return compactRows(payload)
  if (payload && typeof payload === 'object' && 'jobs' in payload) {
    const wrapped = payload as { jobs: unknown[]; metadata?: unknown }
    return { metadata: wrapped.metadata, jobs: compactRows(wrapped.jobs) }
  }
  return payload
}

const stringOrNull = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  return null
}

const numberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  return null
}

const booleanOrNull = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', 'yes', 'y', 'remote', 'hybrid'].includes(normalized)) {
      return true
    }
    if (['false', 'no', 'n', 'onsite', 'on-site'].includes(normalized)) {
      return false
    }
  }
  return null
}

const buildLocation = (raw: RawJob): { label: string; country?: string; state?: string; city?: string } => {
  const location = stringOrNull(raw.location)
  const city = stringOrNull(raw.city_inferred)
  const state = stringOrNull(raw.state_inferred)
  const rawCountry = stringOrNull(raw.country_inferred) ?? stringOrNull(raw.country)

  // Normalize country from explicit field, or extract from location string
  const country = normalizeCountry(rawCountry ?? undefined)
    ?? extractCountryFromLocation(location)
    ?? null

  const fromParts = [city, state, rawCountry ?? country].filter(Boolean).join(', ')
  const label = location || fromParts || 'Location to be confirmed'
  return {
    label,
    country: country ?? undefined,
    state: state ?? undefined,
    city: city ?? undefined,
  }
}

const normaliseJob = (raw: RawJob): Job => {
  const title = stringOrNull(raw.title) ?? stringOrNull(raw.job_title_inferred) ?? 'Data Engineer'
  const company = stringOrNull(raw.company) ?? stringOrNull(raw.company_name_inferred) ?? 'Confidential'
  const { label: location, country, state, city } = buildLocation(raw)
  const jobType = stringOrNull(raw.job_type) ?? stringOrNull(raw.job_type_inferred)
  const postingDate = stringOrNull(raw.date_posted)
  const minSalary = numberOrNull(raw.min_amount)
  const maxSalary = numberOrNull(raw.max_amount)
  const currency = stringOrNull(raw.currency)
  const isRemote = booleanOrNull(raw.is_remote)
  const industry = stringOrNull(raw.company_industry) ?? stringOrNull(raw.company_industry_inferred)
  const domains = stringOrNull(raw.domains_inferred)

  const techSkills = parseSkillList(
    stringOrNull(raw.desired_tech_skills_inferred) ?? stringOrNull(raw.tech_skills) ?? undefined,
  )
  const softSkills = parseSkillList(
    stringOrNull(raw.desired_soft_skills_inferred) ?? stringOrNull(raw.soft_skills) ?? undefined,
  )
  const domainSkills = parseSkillList(
    stringOrNull(raw.desired_domain_skills_inferred) ?? stringOrNull(raw.domain_skills) ?? undefined,
  )

  return {
    id: String(raw.job_hash ?? raw.id ?? `${title}-${company}-${postingDate ?? ''}`),
    title,
    company,
    location,
    country,
    state,
    city,
    jobType,
    postingDate,
    source: stringOrNull(raw.site),
    jobUrl: stringOrNull(raw.job_url) ?? stringOrNull(raw.job_url_direct),
    companyUrl: stringOrNull(raw.company_website_inferred) ?? stringOrNull(raw.company_url),
    companyDescription: stringOrNull(raw.company_description_inferred) ?? stringOrNull(raw.company_description),
    minSalary,
    maxSalary,
    currency,
    isRemote,
    techSkills,
    softSkills,
    domainSkills,
    summary: stringOrNull(raw.job_description_inferred) ?? stringOrNull(raw.job_description) ?? stringOrNull(raw.description),
    requirements: stringOrNull(raw.job_requirements_inferred),
    responsibilities: stringOrNull(raw.job_responsibilities_inferred),
    benefits: stringOrNull(raw.job_benefits_inferred),
    industry,
    domains,
    raw: Object.fromEntries(CACHE_FIELDS.filter((key) => key in raw).map((key) => [key, raw[key]])),
  }
}

export const normaliseJobs = (data: unknown): Job[] => {
  if (!data) {
    return []
  }
  
  // Handle new format with metadata wrapper
  if (typeof data === 'object' && data !== null && 'jobs' in data) {
    const jobsData = data as JobsData
    if (Array.isArray(jobsData.jobs)) {
      return jobsData.jobs.map((item) => normaliseJob((item ?? {}) as RawJob))
    }
  }
  
  // Handle legacy array format
  if (Array.isArray(data)) {
    return data.map((item) => normaliseJob((item ?? {}) as RawJob))
  }
  
  if (typeof data === 'object') {
    return [normaliseJob(data as RawJob)]
  }
  
  throw new Error('Unsupported jobs payload received from the API')
}

export const extractMetadata = (data: unknown): JobsData['metadata'] | null => {
  if (typeof data === 'object' && data !== null && 'metadata' in data) {
    const jobsData = data as JobsData
    return jobsData.metadata
  }
  return null
}

const describeError = (error: unknown, url: string): string => {
  if (error instanceof Error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      return `${error.message} (the server at ${url} may be blocking cross-origin requests)`
    }
    return error.message
  }
  return String(error)
}

const fetchFromUrl = async (url: string): Promise<unknown> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const payload = await response.json()
    return payload
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error))
  }
}

export interface FetchJobsResult {
  jobs: Job[]
  metadata: JobsData['metadata'] | null
}

const CACHE_KEY = 'jobs_analyzer_cache'

const getCachedData = (): unknown | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    localStorage.removeItem(CACHE_KEY)
  }
  return null
}

const setCachedData = (payload: unknown): void => {
  const compacted = compactPayload(payload)
  const persist = () => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(compacted))
    } catch {
      // Storage full or unavailable, skip caching
    }
  }
  const requestIdle = (window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number }).requestIdleCallback
  if (requestIdle) {
    requestIdle(persist, { timeout: 1500 })
  } else {
    setTimeout(persist, 0)
  }
}

export const fetchJobs = async (
  dataUrl = import.meta.env.VITE_JOBS_DATA_URL || `${import.meta.env.BASE_URL}api/jobs`,
  fallbackUrl = `${import.meta.env.BASE_URL}jobs.json`,
): Promise<FetchJobsResult> => {
  const cached = getCachedData()
  const errors: string[] = []
  const trimmedPrimaryUrl = dataUrl?.trim()

  if (trimmedPrimaryUrl) {
    try {
      const payload = await fetchFromUrl(trimmedPrimaryUrl)
      setCachedData(payload)
      return {
        jobs: normaliseJobs(payload),
        metadata: extractMetadata(payload),
      }
    } catch (error) {
      errors.push(`Primary source ${trimmedPrimaryUrl} failed: ${describeError(error, trimmedPrimaryUrl)}`)
    }
  } else {
    errors.push('Primary jobs data URL is not configured via VITE_JOBS_DATA_URL.')
  }

  const trimmedFallbackUrl = fallbackUrl?.trim()
  if (trimmedFallbackUrl) {
    try {
      const payload = await fetchFromUrl(trimmedFallbackUrl)
      setCachedData(payload)
      return {
        jobs: normaliseJobs(payload),
        metadata: extractMetadata(payload),
      }
    } catch (error) {
      errors.push(`Fallback source ${trimmedFallbackUrl} failed: ${describeError(error, trimmedFallbackUrl)}`)
    }
  } else {
    errors.push('Fallback jobs data URL is empty.')
  }

  if (cached) {
    return {
      jobs: normaliseJobs(cached),
      metadata: extractMetadata(cached),
    }
  }

  throw new Error(
    [
      'Unable to load jobs data.',
      ...errors,
      'If you are fetching from Cloudflare R2 or another external store, enable CORS for your bucket or host the JSON file at web/public/jobs.json and ensure the path is reachable from your deployment.',
    ].join(' '),
  )
}
