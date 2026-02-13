import type { Job } from '../types/job'
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
  const country = stringOrNull(raw.country_inferred)

  const fromParts = [city, state, country].filter(Boolean).join(', ')
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
    minSalary,
    maxSalary,
    currency,
    isRemote,
    techSkills,
    softSkills,
    domainSkills,
    summary: stringOrNull(raw.job_description_inferred),
    requirements: stringOrNull(raw.job_requirements_inferred),
    responsibilities: stringOrNull(raw.job_responsibilities_inferred),
    benefits: stringOrNull(raw.job_benefits_inferred),
    industry,
    domains,
    raw,
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

export const fetchJobs = async (
  dataUrl = import.meta.env.VITE_JOBS_DATA_URL,
  fallbackUrl = '/jobs.json',
): Promise<FetchJobsResult> => {
  const errors: string[] = []
  const trimmedPrimaryUrl = dataUrl?.trim()

  if (trimmedPrimaryUrl) {
    try {
      const payload = await fetchFromUrl(trimmedPrimaryUrl)
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

  throw new Error(
    [
      'Unable to load jobs data.',
      ...errors,
      'If you are fetching from Cloudflare R2 or another external store, enable CORS for your bucket or host the JSON file at web/public/jobs.json and ensure the path is reachable from your deployment.',
    ].join(' '),
  )
}
