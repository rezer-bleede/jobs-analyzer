import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { ThemeToggle } from './components/ThemeToggle'
import { HomePage } from './pages/HomePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CustomAnalyticsPage } from './pages/CustomAnalyticsPage'
import { fetchJobs, type FetchJobsResult } from './services/jobsService'
import type { Job, JobFilters } from './types/job'
import type { JobsMetadata } from './types/metadata'
import {
  DATE_POSTED_OPTIONS,
  applyFilters,
  defaultFilters,
  deriveLocationOptions,
  deriveCountryOptions,
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

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Import React for ErrorBoundary
import React from 'react'

function AppContent() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [metadata, setMetadata] = useState<JobsMetadata | null>(null)
  const [filters, setFilters] = useState<JobFilters>({ ...defaultFilters })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    const loadJobs = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result: FetchJobsResult = await fetchJobs()
        if (!ignore) {
          setJobs(result.jobs)
          setMetadata(result.metadata)
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
  const countryOptions = useMemo(() => deriveCountryOptions(jobs), [jobs])
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
    <div className="app bg-body-tertiary min-vh-100 d-flex flex-column">
      <header className="bg-white dark:bg-gray-900 neon:bg-neon-surface border-b border-gray-200 dark:border-gray-700 neon:border-neon-pink/30">
        <div className="container-lg py-3 flex flex-wrap justify-between items-center gap-3">
          <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 neon:text-neon-cyan flex items-center gap-2 no-underline">
            <img src="/logo-icon.svg" alt="Jobs Analyzer" width="32" height="32" />
            <span>Jobs Analyzer</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <Link to="/" className="px-4 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 neon:text-neon-cyan hover:bg-gray-100 dark:hover:bg-gray-800 neon:hover:bg-neon-surface-hover transition-colors no-underline">
              Jobs board
            </Link>
            <Link to="/analytics" className="px-4 py-2 rounded-lg border border-blue-600 dark:border-blue-400 neon:border-neon-pink text-sm font-medium text-blue-600 dark:text-blue-400 neon:text-neon-pink hover:bg-blue-50 dark:hover:bg-blue-900/30 neon:hover:bg-neon-pink/10 transition-colors no-underline">
              Analytics dashboard
            </Link>
            <Link to="/custom-analytics" className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 neon:bg-neon-lime text-white dark:text-white neon:text-gray-900 text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 neon:hover:bg-neon-lime/80 transition-colors no-underline">
              Custom analytics
            </Link>
            <ThemeToggle />
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
              countryOptions={countryOptions}
              searchOptions={searchOptions}
              datePostedOptions={DATE_POSTED_OPTIONS}
              skillFrequency={filteredSkillFrequency}
              metrics={filteredMetrics}
              isLoading={isLoading}
              error={error}
              metadata={metadata}
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
              metadata={metadata}
            />
          }
        />
        <Route
          path="/custom-analytics"
          element={<CustomAnalyticsPage jobs={jobs} isLoading={isLoading} error={error} metadata={metadata} />}
        />
      </Routes>

      <footer className="py-4 text-center text-body-secondary small mt-auto">
        Built with ❤️ using React, Bootstrap, and Cloudflare Pages · Data source served from Cloudflare R2
      </footer>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
