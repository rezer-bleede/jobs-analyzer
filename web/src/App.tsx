import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { ThemeToggle } from './components/ThemeToggle'
import { HomePage } from './pages/HomePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CustomAnalyticsPage } from './pages/CustomAnalyticsPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { CompanyDetailPage } from './pages/CompanyDetailPage'
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

import React from 'react'

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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="card-modern p-8 max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm overflow-auto max-h-40 mb-4">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
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
    <div className="app bg-slate-50 dark:bg-slate-950">
      <header className="glass sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <img src="/logo-icon.svg" alt="" className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Jobs Analyzer
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="btn-ghost text-sm"
            >
              Jobs board
            </Link>
            <Link
              to="/companies"
              className="btn-ghost text-sm"
            >
              Companies
            </Link>
            <Link
              to="/analytics"
              className="btn-secondary text-sm"
            >
              Analytics
            </Link>
            <Link
              to="/custom-analytics"
              className="btn-primary text-sm"
            >
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
          path="/companies"
          element={
            <CompaniesPage
              jobs={jobs}
              isLoading={isLoading}
              error={error}
              metadata={metadata}
            />
          }
        />
        <Route
          path="/companies/:companyName"
          element={
            <CompanyDetailPage
              jobs={jobs}
              isLoading={isLoading}
              error={error}
              metadata={metadata}
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

      <footer className="py-6 text-center text-slate-500 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          Built with React, Tailwind CSS, and Cloudflare Pages · Data served from Cloudflare R2
        </div>
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
