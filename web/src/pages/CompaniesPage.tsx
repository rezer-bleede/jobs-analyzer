import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, MapPin, Briefcase, Users, Search, X } from 'lucide-react'
import { DataFreshness } from '../components/DataFreshness'
import { JobViewToggle } from '../components/JobViewToggle'
import { useJobView } from '../hooks/useJobView'
import type { Job } from '../types/job'
import type { EmployerRecord } from '../types/employer'
import type { CompanyAlias } from '../types/companyAlias'
import type { CompanyIdentity } from '../types/companyIdentity'
import type { JobsMetadata } from '../types/metadata'
import { buildCompanies, filterCompanies, deriveFilterOptions, type CompanyInfo, type CompanyFilters, defaultCompanyFilters } from '../utils/companies'

interface CompaniesPageProps {
  jobs: Job[]
  employers: EmployerRecord[]
  companyAliases?: CompanyAlias[]
  companyIdentities?: CompanyIdentity[]
  isLoading: boolean
  error: string | null
  metadata: JobsMetadata | null
}

const formatSalary = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

const websiteLabel = (company: CompanyInfo): string | null => {
  const value = company.employer?.domain ?? company.website
  if (!value) return null
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

const companyHref = (company: CompanyInfo) =>
  `/companies/${encodeURIComponent(company.name)}${company.canonicalId ? `?canonicalId=${company.canonicalId}` : ''}`

const CompanyCard = memo(({ company }: { company: CompanyInfo }) => {
  return (
    <Link
      to={companyHref(company)}
      className="section-card overflow-hidden block no-underline cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-violet-300 dark:hover:border-violet-700"
    >
      <div>
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{company.name}</h3>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
              {company.jobCount} {company.jobCount === 1 ? 'role' : 'roles'}
              </span>
              {company.industries.length > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {company.industries[0]}
                </span>
              )}
              {company.countries.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {company.countries.slice(0, 2).join(', ')}
                  {company.countries.length > 2 && ` +${company.countries.length - 2}`}
                </span>
              )}
            </div>
            {(company.employer?.lei || company.employer?.is_ai_active || company.employer?.careers_sa_url) && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {company.employer.lei && <span className="badge badge-success text-xs">GLEIF identity</span>}
                {company.employer.is_ai_active && <span className="badge badge-primary text-xs">Hugging Face activity</span>}
                {company.employer.careers_sa_url && (
                  <span className="badge badge-secondary text-xs">
                    careers.sa: {company.employer.careers_sa_open_jobs ?? 0} listed openings
                  </span>
                )}
              </div>
            )}
            {company.sources.length > 0 && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Sources: {company.sources.join(', ')}
              </p>
            )}
            {company.website && (
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                Website: {company.employer?.domain ?? company.website}
              </p>
            )}
            {(company.employer?.jobs_seen != null || company.employer?.data_ai_jobs_90d != null) && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {company.employer.data_ai_jobs_90d != null && `${company.employer.data_ai_jobs_90d} data & AI jobs (90 days)`}
                {company.employer.data_ai_jobs_90d != null && company.employer.jobs_seen != null && ' · '}
                {company.employer.jobs_seen != null && `${company.employer.jobs_seen} jobs seen`}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex gap-2">
              {company.remoteCount > 0 && (
                <span className="badge badge-success text-xs">Remote: {company.remoteCount}</span>
              )}
              {company.onsiteCount > 0 && (
                <span className="badge badge-accent text-xs">On-site: {company.onsiteCount}</span>
              )}
            </div>
            {company.hasSalaryData && company.avgMinSalary && company.avgMaxSalary && company.salaryCurrency && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {formatSalary(company.avgMinSalary, company.salaryCurrency)} - {formatSalary(company.avgMaxSalary, company.salaryCurrency)}
              </span>
            )}
          </div>
        </div>

        {company.topTechSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {company.topTechSkills.map(skill => (
              <span key={skill} className="badge badge-primary text-xs">{skill}</span>
            ))}
          </div>
        )}

        <span className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
          View company details →
        </span>
      </div>
    </Link>
  )
})

CompanyCard.displayName = 'CompanyCard'

const CompanyListRow = memo(({ company }: { company: CompanyInfo }) => (
  <Link
    to={companyHref(company)}
    className="company-row flex flex-wrap items-center justify-between gap-x-4 gap-y-2 no-underline"
  >
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{company.name}</h3>
        <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
          <Users className="w-4 h-4" />
          {company.jobCount} {company.jobCount === 1 ? 'role' : 'roles'}
        </span>
        {company.industries[0] && <span className="max-w-[18rem] truncate text-sm text-slate-500 dark:text-slate-400" title={company.industries[0]}>{company.industries[0]}</span>}
        {company.countries.length > 0 && (
          <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <MapPin className="w-4 h-4" />
            {company.countries.slice(0, 2).join(', ')}
          </span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
        {company.locations.length > 0 && <span className="max-w-[22rem] truncate" title={company.locations.join(', ')}>{company.locations.slice(0, 2).join(', ')}{company.locations.length > 2 && ` +${company.locations.length - 2}`}</span>}
        {company.sources.length > 0 && <span className="max-w-[14rem] truncate" title={company.sources.join(', ')}>Sources: {company.sources.join(', ')}</span>}
        {websiteLabel(company) && <span className="max-w-[18rem] truncate" title={company.website ?? undefined}>{websiteLabel(company)}</span>}
        {company.employer?.data_ai_jobs_90d != null && <span>{company.employer.data_ai_jobs_90d} data & AI jobs (90 days)</span>}
        {company.topTechSkills.length > 0 && <span className="max-w-[18rem] truncate" title={company.topTechSkills.join(', ')}>Skills: {company.topTechSkills.join(', ')}</span>}
      </div>
    </div>
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      {company.remoteCount > 0 && <span className="badge badge-success">Remote: {company.remoteCount}</span>}
      {company.onsiteCount > 0 && <span className="badge badge-accent">On-site: {company.onsiteCount}</span>}
      {company.hasSalaryData && company.avgMinSalary && company.avgMaxSalary && company.salaryCurrency && (
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {formatSalary(company.avgMinSalary, company.salaryCurrency)} – {formatSalary(company.avgMaxSalary, company.salaryCurrency)}
        </span>
      )}
    </div>
  </Link>
))

CompanyListRow.displayName = 'CompanyListRow'

export const CompaniesPage = ({ jobs, employers, companyAliases = [], companyIdentities = [], isLoading, error, metadata }: CompaniesPageProps) => {
  const [filters, setFilters] = useState<CompanyFilters>({ ...defaultCompanyFilters })
  const [view, setView] = useJobView()

  const companies = useMemo(() => buildCompanies(jobs, employers, companyAliases, companyIdentities), [jobs, employers, companyAliases, companyIdentities])
  const filterOptions = useMemo(() => deriveFilterOptions(companies), [companies])
  const filteredCompanies = useMemo(() => filterCompanies(companies, filters), [companies, filters])

  const updateFilter = (key: keyof CompanyFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ ...defaultCompanyFilters })
  }

  const hasActiveFilters = 
    filters.search || 
    filters.industry !== 'All industries' || 
    filters.location !== 'All locations' ||
    filters.jobTitle !== 'All titles' ||
    filters.jobType !== 'All types'

  return (
    <main className="py-3 lg:py-4">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap justify-between items-center gap-3 mb-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Companies</h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
              {isLoading
                ? 'Loading company data...'
                : `${companies.length.toLocaleString()} companies hiring across ${jobs.length.toLocaleString()} roles. Explore by industry, location, or skills.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 dark:text-slate-300">
              <DataFreshness metadata={metadata} isLoading={isLoading} />
            </div>
            <Link to="/" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to jobs
            </Link>
          </div>
        </header>

        {error && (
          <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <h2 className="font-semibold text-red-800 dark:text-red-200 mb-1">Company data unavailable</h2>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <section className="section-card mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4">
            <div className="relative md:col-span-2 lg:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-300 pointer-events-none" />
              <input
                type="text"
                className="input-modern pl-10"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by company, industry, skill, or location..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
            <select
              className="input-modern lg:col-span-2"
              value={filters.industry}
              onChange={(e) => updateFilter('industry', e.target.value)}
            >
              {filterOptions.industries.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              className="input-modern lg:col-span-2"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
            >
              {filterOptions.locations.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              className="input-modern lg:col-span-2"
              value={filters.jobTitle}
              onChange={(e) => updateFilter('jobTitle', e.target.value)}
            >
              {filterOptions.jobTitles.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              className="input-modern lg:col-span-2"
              value={filters.jobType}
              onChange={(e) => updateFilter('jobType', e.target.value)}
            >
              {filterOptions.jobTypes.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary flex items-center justify-center gap-1 md:col-span-2 lg:col-span-12 lg:justify-self-start"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </div>
        </section>

        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isLoading ? 'Loading...' : `${filteredCompanies.length.toLocaleString()} companies`}
          </h2>
          {!isLoading && filteredCompanies.length !== companies.length && (
            <span className="badge badge-secondary">
              Filtered from {companies.length.toLocaleString()} total
            </span>
          )}
          <JobViewToggle view={view} onChange={setView} label="Company layout" />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && filteredCompanies.length === 0 && (
          <div className="section-card text-center py-12">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No companies match your filters</h3>
            <p className="text-slate-500 dark:text-slate-300 max-w-md mx-auto">
              Try adjusting your search or clearing the filters to see more companies.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="btn-primary mt-4"
            >
              Clear all filters
            </button>
          </div>
        )}

        {!isLoading && view === 'list' && (
          <div className="company-list">
            {filteredCompanies.map(company => <CompanyListRow key={company.name} company={company} />)}
          </div>
        )}
        {!isLoading && view === 'cards' && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {filteredCompanies.map(company => <CompanyCard key={company.name} company={company} />)}
          </div>
        )}
        {!isLoading && view === 'table' && (
          <div className="job-card overflow-x-auto">
            <table className="table-modern">
              <caption className="sr-only">Companies and available hiring data</caption>
              <thead>
                <tr>
                  <th scope="col">Company</th>
                  <th scope="col">Roles</th>
                  <th scope="col">Industry</th>
                  <th scope="col">Locations</th>
                  <th scope="col">Sources</th>
                  <th scope="col">Technology</th>
                  <th scope="col">Website</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map(company => (
                  <tr key={company.name}>
                    <td className="min-w-48"><Link to={companyHref(company)} className="job-title-link font-semibold">{company.name}</Link></td>
                    <td className="whitespace-nowrap">{company.jobCount}</td>
                    <td>{company.industries.join(', ') || '—'}</td>
                    <td>{[...new Set([...company.countries, ...company.locations])].join(', ') || '—'}</td>
                    <td>{company.sources.join(', ') || '—'}</td>
                    <td>{company.topTechSkills.join(', ') || '—'}</td>
                    <td>{company.employer?.domain ?? company.website ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
