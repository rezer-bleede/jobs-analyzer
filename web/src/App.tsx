import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import { ThemeToggle } from './components/ThemeToggle'
import { HomePage } from './pages/HomePage'
import { fetchJobs, type FetchJobsResult } from './services/jobsService'
import type { Job, JobFilters } from './types/job'
import type { JobsMetadata } from './types/metadata'
import {
  DATE_POSTED_OPTIONS,
  applyFilters,
  buildJobSearchIndex,
  defaultFilters,
  deriveLocationOptions,
  deriveCountryOptions,
  deriveSearchOptions,
  normalizeCountry,
} from './utils/jobFilters'
import { buildSkillFrequency } from './utils/skills'

const CustomAnalyticsPage = lazy(() => import('./pages/CustomAnalyticsPage').then((module) => ({ default: module.CustomAnalyticsPage })))
const AnalyticsRoute = lazy(() => import('./pages/AnalyticsRoute').then((module) => ({ default: module.AnalyticsRoute })))
const CompaniesPage = lazy(() => import('./pages/CompaniesPage').then((module) => ({ default: module.CompaniesPage })))
const CompanyDetailPage = lazy(() => import('./pages/CompanyDetailPage').then((module) => ({ default: module.CompanyDetailPage })))
const JobDetailPage = lazy(() => import('./pages/JobDetailPage').then((module) => ({ default: module.JobDetailPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

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

  const searchIndex = useMemo(() => buildJobSearchIndex(jobs), [jobs])
  const filteredJobs = useMemo(() => applyFilters(jobs, filters, searchIndex), [jobs, filters, searchIndex])
  const locationOptions = useMemo(() => deriveLocationOptions(jobs), [jobs])
  const countryOptions = useMemo(() => deriveCountryOptions(jobs), [jobs])
  const searchOptions = useMemo(() => deriveSearchOptions(jobs), [jobs])
  const filteredSkillFrequency = useMemo(() => buildSkillFrequency(filteredJobs), [filteredJobs])
  const filteredMetrics = useMemo(
    () => ({
      total: filteredJobs.length,
      remote: filteredJobs.filter((job) => job.isRemote === true).length,
      companies: new Set(filteredJobs.map((job) => job.company)).size,
      countries: new Set(filteredJobs.map((job) => normalizeCountry(job.country)).filter(Boolean)).size,
    }),
    [filteredJobs],
  )

  const overallMetrics = useMemo(
    () => ({
      total: jobs.length,
      remote: jobs.filter((job) => job.isRemote === true).length,
      companies: new Set(jobs.map((job) => job.company)).size,
      countries: new Set(jobs.map((job) => normalizeCountry(job.country)).filter(Boolean)).size,
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
      <header className="site-header sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
              <img src={`${import.meta.env.BASE_URL}logo-icon.svg`} alt="" className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
              Jobs Analyzer
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              Jobs board
            </NavLink>
            <NavLink to="/companies" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              Companies
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              Analytics
            </NavLink>
            <NavLink to="/custom-analytics" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              Custom analytics
            </NavLink>
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
            <Suspense fallback={<RouteLoading />}>
            <CompaniesPage
              jobs={jobs}
              isLoading={isLoading}
              error={error}
              metadata={metadata}
            />
            </Suspense>
          }
        />
        <Route
          path="/companies/:companyName"
          element={
            <Suspense fallback={<RouteLoading />}>
            <CompanyDetailPage
              jobs={jobs}
              isLoading={isLoading}
              error={error}
              metadata={metadata}
            />
            </Suspense>
          }
        />
        <Route path="/jobs/:jobId" element={<Suspense fallback={<RouteLoading />}><JobDetailPage jobs={jobs} isLoading={isLoading} error={error} metadata={metadata} /></Suspense>} />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<RouteLoading />}>
              <AnalyticsRoute jobs={jobs} isLoading={isLoading} error={error} metadata={metadata} metrics={overallMetrics} />
            </Suspense>
          }
        />
        <Route path="*" element={<Suspense fallback={<RouteLoading />}><NotFoundPage /></Suspense>} />
        <Route
          path="/custom-analytics"
          element={
            <Suspense fallback={<RouteLoading />}>
              <CustomAnalyticsPage jobs={jobs} isLoading={isLoading} error={error} metadata={metadata} />
            </Suspense>
          }
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

const RouteLoading = () => (
  <main className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500 dark:text-slate-400" role="status">
    Loading analytics…
  </main>
)

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
