import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3 } from 'lucide-react'
import { FilterBar } from '../components/FilterBar'
import { JobCollection } from '../components/JobCollection'
import { JobViewToggle } from '../components/JobViewToggle'
import { SkillHighlights } from '../components/SkillHighlights'
import { SummaryMetrics } from '../components/SummaryMetrics'
import { DataFreshness } from '../components/DataFreshness'
import { useJobView } from '../hooks/useJobView'
import type { Job, JobFilters } from '../types/job'
import type { JobsMetadata } from '../types/metadata'
import type { SkillFrequency } from '../utils/skills'

const JOBS_PER_PAGE = 30

interface HomePageProps {
  jobs: Job[]
  filteredJobs: Job[]
  filters: JobFilters
  locationOptions: string[]
  countryOptions: string[]
  searchOptions: string[]
  datePostedOptions: readonly string[]
  skillFrequency: SkillFrequency[]
  metrics: {
    total: number
    remote: number
    companies: number
    countries: number
  }
  isLoading: boolean
  error: string | null
  metadata: JobsMetadata | null
  onFiltersChange: (updates: Partial<JobFilters>) => void
  onResetFilters: () => void
}

export const HomePage = ({
  jobs,
  filteredJobs,
  filters,
  locationOptions,
  countryOptions,
  searchOptions,
  datePostedOptions,
  skillFrequency,
  metrics,
  isLoading,
  error,
  metadata,
  onFiltersChange,
  onResetFilters,
}: HomePageProps) => {
  const [page, setPage] = useState(1)
  const [view, setView] = useJobView()
  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE))
  const visibleJobs = filteredJobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [filteredJobs])

  const changePage = (nextPage: number) => {
    setPage(nextPage)
    document.getElementById('job-results')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="py-3 lg:py-4">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-3">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              Data & AI roles in Saudi Arabia
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              className="btn-secondary flex items-center gap-2"
              href="#job-results"
            >
              Jump to results
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/analytics"
              className="btn-primary flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              View analytics
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-red-800 dark:text-red-200 mb-1">We couldn't load the latest opportunities</h2>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <SummaryMetrics
        totalJobs={metrics.total}
        remoteJobs={metrics.remote}
        companies={metrics.companies}
        countries={metrics.countries}
        isLoading={isLoading}
        freshness={<DataFreshness metadata={metadata} isLoading={isLoading} />}
      />

      <FilterBar
        filters={filters}
        locationOptions={locationOptions}
        countryOptions={countryOptions}
        searchOptions={searchOptions}
        datePostedOptions={datePostedOptions}
        isLoading={isLoading}
        onChange={onFiltersChange}
        onReset={onResetFilters}
      />

      <SkillHighlights skills={skillFrequency} />

      <section
        id="job-results"
        className="flex flex-wrap justify-between items-center gap-2 mb-2"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {isLoading
            ? 'Loading roles...'
            : filteredJobs.length <= JOBS_PER_PAGE
              ? `Showing ${filteredJobs.length.toLocaleString()} ${filteredJobs.length === 1 ? 'role' : 'roles'}`
              : `Showing ${((page - 1) * JOBS_PER_PAGE + 1).toLocaleString()}–${Math.min(page * JOBS_PER_PAGE, filteredJobs.length).toLocaleString()} of ${filteredJobs.length.toLocaleString()} roles`}
        </h2>
        <div className="flex items-center gap-2">
          {!isLoading && jobs.length !== filteredJobs.length && (
            <span className="badge badge-secondary">
              Filtered from {jobs.length.toLocaleString()} total
            </span>
          )}
          <JobViewToggle view={view} onChange={setView} />
        </div>
      </section>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && filteredJobs.length === 0 && (
        <div className="section-card text-center py-12">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No roles match your filters yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try broadening your search, exploring another country, or adjusting the posting date filter to see more opportunities.
          </p>
        </div>
      )}

      {!isLoading && visibleJobs.length > 0 && <JobCollection jobs={visibleJobs} view={view} />}

      {!isLoading && pageCount > 1 && (
        <nav aria-label="Job result pages" className="flex items-center justify-center gap-4 mt-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => changePage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => changePage(page + 1)}
            disabled={page === pageCount}
          >
            Next
          </button>
        </nav>
      )}
      </div>
    </main>
  )
}
