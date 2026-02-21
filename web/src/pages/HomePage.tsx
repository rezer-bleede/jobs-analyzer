import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3 } from 'lucide-react'
import { FilterBar } from '../components/FilterBar'
import { JobCard } from '../components/JobCard'
import { SkillHighlights } from '../components/SkillHighlights'
import { SummaryMetrics } from '../components/SummaryMetrics'
import { DataFreshness } from '../components/DataFreshness'
import type { Job, JobFilters } from '../types/job'
import type { JobsMetadata } from '../types/metadata'
import type { SkillFrequency } from '../utils/skills'

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
}: HomePageProps) => (
  <main className="py-6 lg:py-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Middle East data engineering roles
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              A curated feed of vetted opportunities updated continuously. Apply filters to explore{' '}
              <span className="font-semibold text-violet-600 dark:text-violet-400">{jobs.length.toLocaleString()}</span>{' '}
              listings and find the{' '}
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">{filteredJobs.length.toLocaleString()}</span>{' '}
              roles matching your criteria.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
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
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400 items-center">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {isLoading ? 'Refreshing data...' : `${metrics.total.toLocaleString()} live roles · ${metrics.remote.toLocaleString()} remote`}
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Hiring companies: {isLoading ? '—' : metrics.companies}</span>
          <span>•</span>
          <span>Regional coverage: {isLoading ? '—' : `${metrics.countries} countries`}</span>
          <span>•</span>
          <DataFreshness metadata={metadata} isLoading={isLoading} />
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
        className="flex flex-wrap justify-between items-center gap-3 mb-4"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {isLoading ? 'Loading roles...' : `Showing ${filteredJobs.length.toLocaleString()} roles`}
        </h2>
        {!isLoading && jobs.length !== filteredJobs.length && (
          <span className="badge badge-secondary">
            Filtered from {jobs.length.toLocaleString()} total
          </span>
        )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  </main>
)
