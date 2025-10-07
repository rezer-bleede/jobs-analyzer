import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { FilterBar } from './components/FilterBar'
import { JobCard } from './components/JobCard'
import { SkillHighlights } from './components/SkillHighlights'
import { SummaryMetrics } from './components/SummaryMetrics'
import { fetchJobs } from './services/jobsService'
import type { Job, JobFilters } from './types/job'
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
      <main className="py-4 py-md-5">
        <div className="container-lg">
          <header className="hero bg-primary text-white rounded-5 p-4 p-lg-5 mb-5 shadow-sm">
            <div className="row align-items-center g-4">
              <div className="col-lg-7 col-xl-6 text-center text-lg-start">
                <span className="badge bg-white text-primary fw-semibold text-uppercase mb-3">
                  Middle East · Data Engineering
                </span>
                <h1 className="hero__title fw-bold mb-3">
                  Find your next data engineering role in minutes
                </h1>
                <p className="hero__subtitle lead mb-4 text-white-50">
                  Browse vetted opportunities from Riyadh to Dubai and instantly filter by location, contract type, or
                  remote-friendly roles.
                </p>
                <div className="hero__actions d-flex flex-column flex-sm-row gap-3 align-items-stretch align-items-sm-center">
                  <a className="btn btn-light btn-lg text-primary fw-semibold shadow-sm" href="#job-results">
                    Browse open roles
                  </a>
                  <div className="hero__actions-note small text-white-50">
                    <span className="d-block fw-semibold text-white">Focused results</span>
                    Zero fluff—just the roles and filters you need to plan your next move.
                  </div>
                </div>
              </div>
              <div className="col-lg-5 col-xl-4 ms-lg-auto">
                <div className="hero-highlight bg-white text-primary-emphasis rounded-4 shadow-sm p-4">
                  <h2 className="h5 fw-semibold mb-3">Why professionals use this board</h2>
                  <ul className="hero-highlight__list list-unstyled mb-0 d-grid gap-2">
                    <li>
                      Live metrics summarise total, remote, and company coverage so you can prioritise outreach quickly.
                    </li>
                    <li>
                      Instant keyword search keeps the focus on tools that matter—dbt, Spark, Snowflake, and more.
                    </li>
                    <li>Mobile-first layout lets you triage opportunities on the go.</li>
                  </ul>
                </div>
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
