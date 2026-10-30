import type { Job } from '../types/job'
import type { EmployerRecord } from '../types/employer'
import type { CompanyAlias } from '../types/companyAlias'
import { normalizeCountry } from './jobFilters'

export interface CompanyInfo {
  name: string
  canonicalId?: number
  aliases: string[]
  jobCount: number
  locations: string[]
  countries: string[]
  jobTitles: string[]
  industries: string[]
  jobTypes: string[]
  remoteCount: number
  onsiteCount: number
  avgMinSalary: number | null
  avgMaxSalary: number | null
  salaryCurrency: string | null
  topTechSkills: string[]
  topDomainSkills: string[]
  latestPostingDate: string | null
  hasSalaryData: boolean
  sources: string[]
  website: string | null
  description: string | null
  employer?: EmployerRecord
}

export interface CompanyFilters {
  search: string
  industry: string
  location: string
  jobTitle: string
  jobType: string
}

export const defaultCompanyFilters: CompanyFilters = {
  search: '',
  industry: 'All industries',
  location: 'All locations',
  jobTitle: 'All titles',
  jobType: 'All types',
}

export const buildCompanies = (jobs: Job[], employers: EmployerRecord[] = [], aliases: CompanyAlias[] = []): CompanyInfo[] => {
  const aliasByName = new Map<string, CompanyAlias>()
  const aliasesByCanonicalId = new Map<number, Set<string>>()
  const ambiguousAliases = new Set<string>()
  for (const alias of aliases) {
    const key = alias.raw_value.trim().toLowerCase()
    if (!key || !Number.isInteger(alias.canonical_id) || alias.canonical_id <= 0 || !alias.canonical_label.trim()) continue
    const previous = aliasByName.get(key)
    if (previous && (previous.canonical_id !== alias.canonical_id || previous.canonical_label !== alias.canonical_label)) {
      aliasByName.delete(key)
      ambiguousAliases.add(key)
    } else if (!ambiguousAliases.has(key)) {
      aliasByName.set(key, alias)
    }
  }
  for (const alias of aliasByName.values()) {
    const names = aliasesByCanonicalId.get(alias.canonical_id) ?? new Set<string>()
    names.add(alias.raw_value)
    aliasesByCanonicalId.set(alias.canonical_id, names)
  }
  const identity = (name: string) => {
    const normalized = name.trim().toLowerCase()
    if (!normalized) return { key: '', canonicalId: undefined, name }
    const alias = aliasByName.get(normalized)
    return alias
      ? { key: `refdata:${alias.canonical_id}`, canonicalId: alias.canonical_id, name: alias.canonical_label }
      : { key: `name:${normalized}`, canonicalId: undefined, name }
  }

  const employerByName = new Map<string, EmployerRecord>()
  const employerNamesByKey = new Map<string, Set<string>>()
  for (const employer of [...employers].sort((a, b) => (b.jobs_seen ?? 0) - (a.jobs_seen ?? 0))) {
    const key = identity(employer.company_name).key
    if (!key) continue
    const names = employerNamesByKey.get(key) ?? new Set<string>()
    names.add(employer.company_name)
    employerNamesByKey.set(key, names)
    const previous = employerByName.get(key)
    if (!previous) {
      employerByName.set(key, employer)
      continue
    }
    const merged = { ...employer, ...previous } as EmployerRecord
    for (const field of Object.keys(employer) as (keyof EmployerRecord)[]) {
      if (merged[field] == null) merged[field] = employer[field] as never
    }
    merged.cities = [...new Set([...(previous.cities ?? []), ...(employer.cities ?? [])])]
    merged.sources = [...new Set([...(previous.sources ?? []), ...(employer.sources ?? [])])]
    employerByName.set(key, merged)
  }
  const companyMap = new Map<string, {
    name: string
    canonicalId?: number
    aliases: Set<string>
    jobs: Job[]
    locations: Set<string>
    countries: Set<string>
    jobTitles: Set<string>
    industries: Set<string>
    jobTypes: Set<string>
    sources: Set<string>
    remoteCount: number
    onsiteCount: number
    salaries: { min: number; max: number; currency: string }[]
    techSkills: Map<string, number>
    domainSkills: Map<string, number>
    latestDate: string | null
    website: string | null
    description: string | null
  }>()

  for (const job of jobs) {
    const companyName = job.company.trim()
    if (!companyName) continue

    const resolved = identity(companyName)
    let entry = companyMap.get(resolved.key)
    if (!entry) {
      entry = {
        name: resolved.name,
        canonicalId: resolved.canonicalId,
        aliases: new Set(),
        jobs: [],
        locations: new Set(),
        countries: new Set(),
        jobTitles: new Set(),
        industries: new Set(),
        jobTypes: new Set(),
        sources: new Set(),
        remoteCount: 0,
        onsiteCount: 0,
        salaries: [],
        techSkills: new Map(),
        domainSkills: new Map(),
        latestDate: null,
        website: null,
        description: null,
      }
      companyMap.set(resolved.key, entry)
    }

    entry.aliases.add(companyName)
    entry.jobs.push(job)

    if (job.location) entry.locations.add(job.location)
    if (job.country) {
      const normalized = normalizeCountry(job.country)
      if (normalized) entry.countries.add(normalized)
    }
    if (job.title) entry.jobTitles.add(job.title)
    if (job.industry) entry.industries.add(job.industry)
    if (job.jobType) entry.jobTypes.add(job.jobType)
    if (job.source) entry.sources.add(job.source)
    entry.website ??= job.companyUrl ?? null
    entry.description ??= job.companyDescription ?? null

    if (job.isRemote === true) entry.remoteCount++
    else if (job.isRemote === false) entry.onsiteCount++

    if (job.minSalary && job.maxSalary && job.currency) {
      entry.salaries.push({ min: job.minSalary, max: job.maxSalary, currency: job.currency })
    }

    for (const skill of job.techSkills) {
      entry.techSkills.set(skill, (entry.techSkills.get(skill) || 0) + 1)
    }
    for (const skill of job.domainSkills) {
      entry.domainSkills.set(skill, (entry.domainSkills.get(skill) || 0) + 1)
    }

    if (job.postingDate) {
      if (!entry.latestDate || job.postingDate > entry.latestDate) {
        entry.latestDate = job.postingDate
      }
    }
  }

  const companies: CompanyInfo[] = []

  for (const [key, data] of companyMap) {
    let avgMinSalary: number | null = null
    let avgMaxSalary: number | null = null
    let salaryCurrency: string | null = null

    if (data.salaries.length > 0) {
      const firstCurrency = data.salaries[0].currency
      const sameCurrency = data.salaries.every(s => s.currency === firstCurrency)
      
      if (sameCurrency) {
        avgMinSalary = data.salaries.reduce((sum, s) => sum + s.min, 0) / data.salaries.length
        avgMaxSalary = data.salaries.reduce((sum, s) => sum + s.max, 0) / data.salaries.length
        salaryCurrency = firstCurrency
      }
    }

    const topTechSkills = [...data.techSkills.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill)

    const topDomainSkills = [...data.domainSkills.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill)

    const employer = employerByName.get(key)
    const employerAliases = employerNamesByKey.get(key) ?? []
    const mappedAliases = data.canonicalId == null ? [] : aliasesByCanonicalId.get(data.canonicalId) ?? []
    companies.push({
      name: data.name,
      canonicalId: data.canonicalId,
      aliases: [...new Set([...data.aliases, ...employerAliases, ...mappedAliases])],
      jobCount: data.jobs.length,
      locations: [...new Set([...data.locations, ...(employer?.cities ?? [])])].sort(),
      countries: [...data.countries].sort(),
      jobTitles: [...data.jobTitles].sort(),
      industries: [...data.industries].sort(),
      jobTypes: [...data.jobTypes].sort(),
      remoteCount: data.remoteCount,
      onsiteCount: data.onsiteCount,
      avgMinSalary,
      avgMaxSalary,
      salaryCurrency,
      topTechSkills,
      topDomainSkills,
      latestPostingDate: data.latestDate,
      hasSalaryData: data.salaries.length > 0,
      sources: [...new Set([...data.sources, ...(employer?.sources ?? [])])].sort(),
      website: employer?.company_url || (employer?.domain ? `https://${employer.domain}` : null) || data.website,
      description: data.description,
      employer,
    })
  }

  const includedKeys = new Set(companyMap.keys())
  for (const [key, employer] of employerByName) {
    if (includedKeys.has(key)) continue
    const resolved = identity(employer.company_name)
    companies.push({
      name: resolved.name,
      canonicalId: resolved.canonicalId,
      aliases: [...new Set([
        ...(employerNamesByKey.get(key) ?? []),
        ...(resolved.canonicalId == null ? [] : aliasesByCanonicalId.get(resolved.canonicalId) ?? []),
      ])],
      jobCount: 0,
      locations: employer.cities ?? [],
      countries: ['Saudi Arabia'],
      jobTitles: [],
      industries: employer.industry ? [employer.industry] : [],
      jobTypes: [],
      remoteCount: 0,
      onsiteCount: 0,
      avgMinSalary: null,
      avgMaxSalary: null,
      salaryCurrency: null,
      topTechSkills: [],
      topDomainSkills: [],
      latestPostingDate: null,
      hasSalaryData: false,
      sources: employer.sources ?? [],
      website: employer.company_url || (employer.domain ? `https://${employer.domain}` : null),
      description: null,
      employer,
    })
  }

  return companies.sort((a, b) => b.jobCount - a.jobCount)
}

export const filterCompanies = (companies: CompanyInfo[], filters: CompanyFilters): CompanyInfo[] => {
  return companies.filter(company => {
    if (filters.search) {
      const query = filters.search.toLowerCase()
      const matchesSearch = 
        company.name.toLowerCase().includes(query) ||
        company.industries.some(i => i.toLowerCase().includes(query)) ||
        company.locations.some(l => l.toLowerCase().includes(query)) ||
        company.jobTitles.some(t => t.toLowerCase().includes(query)) ||
        company.topTechSkills.some(s => s.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }

    if (filters.industry !== 'All industries') {
      if (!company.industries.includes(filters.industry)) return false
    }

    if (filters.location !== 'All locations') {
      if (!company.locations.some(l => l.includes(filters.location)) && 
          !company.countries.some(c => c.includes(filters.location))) return false
    }

    if (filters.jobTitle !== 'All titles') {
      if (!company.jobTitles.includes(filters.jobTitle)) return false
    }

    if (filters.jobType !== 'All types') {
      if (!company.jobTypes.includes(filters.jobType)) return false
    }

    return true
  })
}

export const deriveFilterOptions = (companies: CompanyInfo[]) => ({
  industries: ['All industries', ...new Set(companies.flatMap(c => c.industries))].sort(),
  locations: ['All locations', ...new Set(companies.flatMap(c => [...c.countries, ...c.locations]))].sort(),
  jobTitles: ['All titles', ...new Set(companies.flatMap(c => c.jobTitles))].sort(),
  jobTypes: ['All types', ...new Set(companies.flatMap(c => c.jobTypes))].sort(),
})
