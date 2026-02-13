export interface Job {
  id: string
  title: string
  company: string
  location: string
  country?: string
  state?: string
  city?: string
  jobType?: string | null
  postingDate?: string | null
  source?: string | null
  jobUrl?: string | null
  minSalary?: number | null
  maxSalary?: number | null
  currency?: string | null
  isRemote: boolean | null
  techSkills: string[]
  softSkills: string[]
  domainSkills: string[]
  summary?: string | null
  requirements?: string | null
  responsibilities?: string | null
  benefits?: string | null
  industry?: string | null
  domains?: string | null
  raw: Record<string, unknown>
}

export interface JobFilters {
  searchTerms: string[]
  location: string
  datePosted: string
  countries: string[]
}
