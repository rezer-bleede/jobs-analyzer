import { Link } from 'react-router-dom'
import { FilterBar } from '../components/FilterBar'
import { JobCard } from '../components/JobCard'
import { SkillHighlights } from '../components/SkillHighlights'
import { SummaryMetrics } from '../components/SummaryMetrics'
import type { Job, JobFilters } from '../types/job'
import type { SkillFrequency } from '../utils/skills'

interface HomePageProps {
  jobs: Job[]
  filteredJobs: Job[]
  filters: JobFilters
  locationOptions: string[]
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
  onFiltersChange: (updates: Partial<JobFilters>) => void
  onResetFilters: () => void
}

export const HomePage = ({
  jobs,
  filteredJobs,
  filters,
  locationOptions,
  searchOptions,
  datePostedOptions,
  skillFrequency,
  metrics,
  isLoading,
  error,
  onFiltersChange,
  onResetFilters,
}: HomePageProps) => (
  <main className="py-4 py-md-5">
    <div className="container-lg">

      {error && (
        <div className="alert alert-danger rounded-4 shadow-sm" role="alert">
          <h2 className="h5">We couldn’t load the latest opportunities</h2>
          <p className="mb-0">{error}</p>
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
        searchOptions={searchOptions}
        datePostedOptions={datePostedOptions}
        isLoading={isLoading}
        onChange={onFiltersChange}
        onReset={onResetFilters}
      />

      <SkillHighlights skills={skillFrequency} />

      <section
        id="job-results"
        className="job-results__header d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
      >
        <h2 className="h4 mb-0">{isLoading ? 'Loading roles…' : `Showing ${filteredJobs.length} roles`}</h2>
        {!isLoading && jobs.length !== filteredJobs.length && (
          <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-2">
            Filtered from {jobs.length} total listings
          </span>
        )}
      </section>

      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" aria-label="Loading jobs" />
        </div>
      )}

      {!isLoading && filteredJobs.length === 0 && (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center">
          <h3 className="h4 mb-3">No roles match your filters yet</h3>
          <p className="text-body-secondary mb-0">
            Try broadening your search, explore another country, or adjust the posting date filter to see more opportunities.
          </p>
        </div>
      )}

      <div className="row row-cols-1 row-cols-lg-2 g-4">
        {filteredJobs.map((job) => (
          <div className="col" key={job.id}>
            <JobCard job={job} />
          </div>
        ))}
      </div>
    </div>
  </main>
)
