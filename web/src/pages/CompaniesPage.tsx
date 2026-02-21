import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, MapPin, Briefcase, Users, Clock, Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import { DataFreshness } from '../components/DataFreshness'
import type { Job } from '../types/job'
import type { JobsMetadata } from '../types/metadata'
import { buildCompanies, filterCompanies, deriveFilterOptions, type CompanyInfo, type CompanyFilters, defaultCompanyFilters } from '../utils/companies'

interface CompaniesPageProps {
  jobs: Job[]
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

const formatDate = (value: string | null): string => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const CompanyCard = memo(({ company }: { company: CompanyInfo }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="section-card overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
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

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show details
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-5 bg-slate-50 dark:bg-slate-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1">Job Titles</p>
              <div className="flex flex-wrap gap-1">
                {company.jobTitles.map(title => (
                  <span key={title} className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">{title}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1">Locations</p>
              <div className="flex flex-wrap gap-1">
                {company.locations.slice(0, 4).map(loc => (
                  <span key={loc} className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">{loc}</span>
                ))}
                {company.locations.length > 4 && (
                  <span className="text-xs text-slate-500">+{company.locations.length - 4} more</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1">Job Types</p>
              <div className="flex flex-wrap gap-1">
                {company.jobTypes.map(type => (
                  <span key={type} className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">{type}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1">Domain Skills</p>
              <div className="flex flex-wrap gap-1">
                {company.topDomainSkills.map(skill => (
                  <span key={skill} className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">{skill}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Latest posting: {formatDate(company.latestPostingDate)}
            </span>
          </div>
        </div>
      )}
    </article>
  )
})

CompanyCard.displayName = 'CompanyCard'

export const CompaniesPage = ({ jobs, isLoading, error, metadata }: CompaniesPageProps) => {
  const [filters, setFilters] = useState<CompanyFilters>({ ...defaultCompanyFilters })

  const companies = useMemo(() => buildCompanies(jobs), [jobs])
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
    <main className="py-6 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">Companies</h1>
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

        <section className="section-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4">
            <div className="relative md:col-span-2 lg:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-300 pointer-events-none" />
              <input
                type="text"
                className="input-modern pl-10"
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

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isLoading ? 'Loading...' : `${filteredCompanies.length.toLocaleString()} companies`}
          </h2>
          {!isLoading && filteredCompanies.length !== companies.length && (
            <span className="badge badge-secondary">
              Filtered from {companies.length.toLocaleString()} total
            </span>
          )}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCompanies.map(company => (
            <CompanyCard key={company.name} company={company} />
          ))}
        </div>
      </div>
    </main>
  )
}
