import type { Job } from '../types/job'

export interface CompanyInfo {
  name: string
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

export const buildCompanies = (jobs: Job[]): CompanyInfo[] => {
  const companyMap = new Map<string, {
    jobs: Job[]
    locations: Set<string>
    countries: Set<string>
    jobTitles: Set<string>
    industries: Set<string>
    jobTypes: Set<string>
    remoteCount: number
    onsiteCount: number
    salaries: { min: number; max: number; currency: string }[]
    techSkills: Map<string, number>
    domainSkills: Map<string, number>
    latestDate: string | null
  }>()

  for (const job of jobs) {
    const companyName = job.company.trim()
    if (!companyName) continue

    let entry = companyMap.get(companyName)
    if (!entry) {
      entry = {
        jobs: [],
        locations: new Set(),
        countries: new Set(),
        jobTitles: new Set(),
        industries: new Set(),
        jobTypes: new Set(),
        remoteCount: 0,
        onsiteCount: 0,
        salaries: [],
        techSkills: new Map(),
        domainSkills: new Map(),
        latestDate: null,
      }
      companyMap.set(companyName, entry)
    }

    entry.jobs.push(job)

    if (job.location) entry.locations.add(job.location)
    if (job.country) entry.countries.add(job.country)
    if (job.title) entry.jobTitles.add(job.title)
    if (job.industry) entry.industries.add(job.industry)
    if (job.jobType) entry.jobTypes.add(job.jobType)

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

  for (const [name, data] of companyMap) {
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

    companies.push({
      name,
      jobCount: data.jobs.length,
      locations: [...data.locations].sort(),
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
