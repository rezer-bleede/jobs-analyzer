import { Link } from 'react-router-dom'
import { ArrowLeft, Users, MapPin, DollarSign, Briefcase } from 'lucide-react'
import { SummaryMetrics } from '../components/SummaryMetrics'
import { DataFreshness } from '../components/DataFreshness'
import { BarChart } from '../components/charts/BarChart'
import { DonutChart } from '../components/charts/DonutChart'
import { SparklineChart } from '../components/charts/SparklineChart'
import type { Job } from '../types/job'
import type { JobsMetadata } from '../types/metadata'
import type { SkillFrequency } from '../utils/skills'
import type {
  CompanyActivity,
  IndustryBreakdown,
  LocationActivity,
  LocationRemoteStat,
  RemoteSplitSegment,
  SalaryBenchmark,
  WeeklyTrendPoint,
} from '../utils/analytics'

interface AnalyticsPageProps {
  jobs: Job[]
  metrics: {
    total: number
    remote: number
    companies: number
    countries: number
  }
  companyActivity: CompanyActivity[]
  locationActivity: LocationActivity[]
  locationRemoteStats: LocationRemoteStat[]
  industryBreakdown: IndustryBreakdown[]
  salaryBenchmarks: SalaryBenchmark[]
  remoteSplit: RemoteSplitSegment[]
  postingTrends: WeeklyTrendPoint[]
  skillFrequency: SkillFrequency[]
  isLoading: boolean
  error: string | null
  metadata: JobsMetadata | null
}

const formatSalary = (value: number, currency: string): string => {
  if (!Number.isFinite(value) || value <= 0) return '—'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

export const AnalyticsPage = ({
  jobs,
  metrics,
  companyActivity,
  locationRemoteStats,
  industryBreakdown,
  salaryBenchmarks,
  remoteSplit,
  postingTrends,
  skillFrequency,
  isLoading,
  error,
  metadata,
}: AnalyticsPageProps) => (
  <main className="py-6 lg:py-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">Talent market analytics</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            {isLoading
              ? 'Refreshing insights from the latest roles feed...'
              : `${jobs.length.toLocaleString()} listings processed. Review velocity, remote adoption, salary benchmarks and geographic coverage.`}
          </p>
        </div>
        <Link to="/" className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to jobs
        </Link>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-red-800 dark:text-red-200 mb-1">Analytics are temporarily unavailable</h2>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <section className="section-card mb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Market snapshot</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Totals across the active dataset. Trends auto-refresh whenever the data feed updates.
            </p>
          </div>
          <div className="lg:text-right text-sm text-slate-500 dark:text-slate-400 flex flex-col lg:items-end gap-2">
            <span>Last refreshed {isLoading ? '...' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}</span>
            <DataFreshness metadata={metadata} isLoading={isLoading} />
          </div>
        </div>
        <SummaryMetrics
          totalJobs={metrics.total}
          remoteJobs={metrics.remote}
          companies={metrics.companies}
          countries={metrics.countries}
          isLoading={isLoading}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="section-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Hiring velocity</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Weekly postings for the past quarter with remote contributions highlighted.
              </p>
            </div>
            <span className="badge badge-secondary">{postingTrends.length} weeks</span>
          </div>
          <SparklineChart
            data={postingTrends.map((point) => ({ label: point.label, value: point.total }))}
            ariaLabel="Weekly job posting trend"
            height={120}
          />
          <div className="mt-4">
            <BarChart
              data={postingTrends
                .slice(-5)
                .map((point) => ({ label: point.label, value: point.total, secondaryValue: point.remote }))}
              condensed
              showValues
              ariaLabel="Remote versus total postings for recent weeks"
            />
          </div>
        </div>
        <div className="section-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Remote adoption</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Share of listings marked as remote, on-site, or unspecified.
              </p>
            </div>
          </div>
          <DonutChart segments={remoteSplit.map((segment) => ({ label: segment.label, value: segment.count }))} ariaLabel="Remote adoption split" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="section-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Salary benchmarks by currency</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Midpoint averages based on roles that disclose salary ranges.
              </p>
            </div>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          {salaryBenchmarks.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No salary data available from the current dataset.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Currency</th>
                    <th className="text-right">Roles</th>
                    <th className="text-right">Avg midpoint</th>
                    <th className="text-right">Range</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryBenchmarks.map((benchmark) => (
                    <tr key={benchmark.currency}>
                      <td className="font-medium">{benchmark.currency}</td>
                      <td className="text-right">{benchmark.roles}</td>
                      <td className="text-right font-medium text-violet-600 dark:text-violet-400">{formatSalary(Math.round(benchmark.average), benchmark.currency)}</td>
                      <td className="text-right text-slate-500 dark:text-slate-400">
                        {formatSalary(benchmark.minimum, benchmark.currency)} – {formatSalary(benchmark.maximum, benchmark.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="section-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Industry momentum</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Top sectors currently investing in data engineering talent.
              </p>
            </div>
            <Briefcase className="w-5 h-5 text-slate-400" />
          </div>
          <BarChart
            data={industryBreakdown.map((item) => ({
              label: item.industry,
              value: item.roles,
              secondaryValue: Math.round(item.remoteShare * item.roles),
            }))}
            ariaLabel="Industry hiring volume with remote roles highlighted"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="section-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Most active companies</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ranked by postings published in the last two weeks.
              </p>
            </div>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <BarChart
            data={companyActivity.slice(0, 10).map((item) => ({ label: item.company, value: item.count }))}
            ariaLabel="Companies ranked by job postings"
            condensed
          />
        </div>
        <div className="section-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Location coverage</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Remote mix and totals for the busiest hiring locations.
              </p>
            </div>
            <MapPin className="w-5 h-5 text-slate-400" />
          </div>
          {locationRemoteStats.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No locations available from the current dataset.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th className="text-right">Roles</th>
                    <th className="text-right">Remote</th>
                    <th className="text-right">On-site</th>
                    <th className="text-right">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {locationRemoteStats.slice(0, 8).map((item) => (
                    <tr key={item.location}>
                      <td className="font-medium">{item.location}</td>
                      <td className="text-right">{item.total}</td>
                      <td className="text-right text-cyan-600 dark:text-cyan-400">{item.remote}</td>
                      <td className="text-right">{item.onsite}</td>
                      <td className="text-right">
                        <span className={`badge ${item.remoteShare > 0.3 ? 'badge-success' : 'badge-secondary'}`}>
                          {Math.round(item.remoteShare * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <section className="section-card mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Most in-demand skills</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Aggregated across every live listing. Highlighted skills appear most often in job descriptions.
        </p>
        {skillFrequency.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No skill data available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skillFrequency.slice(0, 24).map((skill, index) => (
              <span
                key={skill.skill}
                className="badge transition-transform hover:scale-105"
                style={{
                  background: index < 5 
                    ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)'
                    : undefined,
                  fontWeight: index < 5 ? 600 : 500,
                }}
              >
                {skill.skill}
                <span className="ml-1.5 opacity-60 text-xs">({skill.count})</span>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  </main>
)
