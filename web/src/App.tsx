import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { FilterBar } from './components/FilterBar'
import { JobCard } from './components/JobCard'
import { SkillHighlights } from './components/SkillHighlights'
import { SummaryMetrics } from './components/SummaryMetrics'
import { fetchJobs } from './services/jobsService'
import { Job, JobFilters } from './types/job'
import {
  applyFilters,
  defaultFilters,
  deriveJobTypeOptions,
  deriveLocationOptions,
} from './utils/jobFilters'
import { buildSkillFrequency } from './utils/skills'

function App() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filters, setFilters] = useState<JobFilters>({ ...defaultFilters })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const loadJobs = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const fetched = await fetchJobs()
        if (!ignore) {
          setJobs(fetched)
        }
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Failed to load jobs data.'
          setError(message)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadJobs()

    return () => {
      ignore = true
    }
  }, [])

  const filteredJobs = useMemo(() => applyFilters(jobs, filters), [jobs, filters])
  const locationOptions = useMemo(() => deriveLocationOptions(jobs), [jobs])
  const jobTypeOptions = useMemo(() => deriveJobTypeOptions(jobs), [jobs])
  const skillFrequency = useMemo(() => buildSkillFrequency(filteredJobs), [filteredJobs])

  const metrics = useMemo(
    () => ({
      total: filteredJobs.length,
      remote: filteredJobs.filter((job) => job.isRemote === true).length,
      companies: new Set(filteredJobs.map((job) => job.company)).size,
      countries: new Set(filteredJobs.map((job) => job.country ?? job.location)).size,
    }),
    [filteredJobs],
  )

  const handleFiltersChange = (updates: Partial<JobFilters>) => {
    setFilters((current) => ({ ...current, ...updates }))
  }

  const handleReset = () => {
    setFilters({ ...defaultFilters })
  }

  return (
    <div className="app bg-body-tertiary min-vh-100">
      <main className="py-5">
        <div className="container-lg">
          <header className="hero bg-primary text-white rounded-5 p-5 mb-5 shadow-sm">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <span className="badge bg-white text-primary fw-semibold text-uppercase mb-3">
                  Middle East · Data Engineering
                </span>
                <h1 className="display-5 fw-bold mb-3">
                  Discover high-impact data engineering roles across the Middle East
                </h1>
                <p className="lead mb-4">
                  Curated opportunities sourced from Cloudflare R2 to help data engineers find their next career move in
                  Riyadh, Dubai, Doha, and beyond.
                </p>
                <p className="mb-0 text-white-50">
                  Keep this page deployed on Cloudflare Pages and configure the{' '}
                  <code>VITE_JOBS_DATA_URL</code> variable with your R2 JSON file to stay in sync with the latest market
                  demand.
                </p>
              </div>
            </div>
          </header>

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
            jobTypeOptions={jobTypeOptions}
            isLoading={isLoading}
            onChange={handleFiltersChange}
            onReset={handleReset}
          />

          <SkillHighlights skills={skillFrequency} />

          <section className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
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
                Try broadening your search, explore another country, or disable the remote-only filter to see more
                opportunities.
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
      <footer className="py-4 text-center text-body-secondary small">
        Built with ❤️ using React, Bootstrap, and Cloudflare Pages · Data source served from Cloudflare R2
      </footer>
    </div>
  )
}

export default App
