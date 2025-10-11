import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CustomAnalyticsPage } from './pages/CustomAnalyticsPage'
import { fetchJobs } from './services/jobsService'
import type { Job, JobFilters } from './types/job'
import {
  DATE_POSTED_OPTIONS,
  applyFilters,
  defaultFilters,
  deriveLocationOptions,
  deriveSearchOptions,
} from './utils/jobFilters'
import { buildSkillFrequency } from './utils/skills'
import {
  buildCompanyActivity,
  buildIndustryBreakdown,
  buildLocationActivity,
  buildLocationRemoteStats,
  buildPostingTrends,
  buildRemoteSplit,
  buildSalaryBenchmarks,
} from './utils/analytics'

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
  const searchOptions = useMemo(() => deriveSearchOptions(jobs), [jobs])
  const filteredSkillFrequency = useMemo(() => buildSkillFrequency(filteredJobs), [filteredJobs])
  const overallSkillFrequency = useMemo(() => buildSkillFrequency(jobs), [jobs])
  const companyActivity = useMemo(() => buildCompanyActivity(jobs), [jobs])
  const locationActivity = useMemo(() => buildLocationActivity(jobs, 8), [jobs])
  const postingTrends = useMemo(() => buildPostingTrends(jobs, 12), [jobs])
  const remoteSplit = useMemo(() => buildRemoteSplit(jobs), [jobs])
  const salaryBenchmarks = useMemo(() => buildSalaryBenchmarks(jobs), [jobs])
  const industryBreakdown = useMemo(() => buildIndustryBreakdown(jobs), [jobs])
  const locationRemoteStats = useMemo(() => buildLocationRemoteStats(jobs, 10), [jobs])

  const filteredMetrics = useMemo(
    () => ({
      total: filteredJobs.length,
      remote: filteredJobs.filter((job) => job.isRemote === true).length,
      companies: new Set(filteredJobs.map((job) => job.company)).size,
      countries: new Set(filteredJobs.map((job) => job.country ?? job.location)).size,
    }),
    [filteredJobs],
  )

  const overallMetrics = useMemo(
    () => ({
      total: jobs.length,
      remote: jobs.filter((job) => job.isRemote === true).length,
      companies: new Set(jobs.map((job) => job.company)).size,
      countries: new Set(jobs.map((job) => job.country ?? job.location)).size,
    }),
    [jobs],
  )

  const handleFiltersChange = (updates: Partial<JobFilters>) => {
    setFilters((current) => ({ ...current, ...updates }))
  }

  const handleReset = () => {
    setFilters({ ...defaultFilters })
  }

  return (
    <BrowserRouter>
      <div className="app bg-body-tertiary min-vh-100 d-flex flex-column">
        <header className="bg-white border-bottom">
          <div className="container-lg py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <Link to="/" className="navbar-brand fs-4 fw-bold text-primary mb-0">
              ME Data Engineering Jobs
            </Link>
            <nav className="d-flex flex-wrap gap-2">
              <Link to="/" className="btn btn-link text-decoration-none fw-semibold text-primary">
                Jobs board
              </Link>
              <Link to="/analytics" className="btn btn-outline-primary fw-semibold">
                Analytics dashboard
              </Link>
              <Link to="/custom-analytics" className="btn btn-primary fw-semibold">
                Custom analytics
              </Link>
            </nav>
          </div>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                jobs={jobs}
                filteredJobs={filteredJobs}
                filters={filters}
                locationOptions={locationOptions}
                searchOptions={searchOptions}
                datePostedOptions={DATE_POSTED_OPTIONS}
                skillFrequency={filteredSkillFrequency}
                metrics={filteredMetrics}
                isLoading={isLoading}
                error={error}
                onFiltersChange={handleFiltersChange}
                onResetFilters={handleReset}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <AnalyticsPage
                jobs={jobs}
                metrics={overallMetrics}
                companyActivity={companyActivity}
                locationActivity={locationActivity}
                locationRemoteStats={locationRemoteStats}
                industryBreakdown={industryBreakdown}
                salaryBenchmarks={salaryBenchmarks}
                remoteSplit={remoteSplit}
                postingTrends={postingTrends}
                skillFrequency={overallSkillFrequency}
                isLoading={isLoading}
                error={error}
              />
            }
          />
          <Route
            path="/custom-analytics"
            element={<CustomAnalyticsPage jobs={jobs} isLoading={isLoading} error={error} />}
          />
        </Routes>

        <footer className="py-4 text-center text-body-secondary small mt-auto">
          Built with ❤️ using React, Bootstrap, and Cloudflare Pages · Data source served from Cloudflare R2
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
