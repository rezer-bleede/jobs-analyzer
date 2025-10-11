import { Link } from 'react-router-dom'
import { SummaryMetrics } from '../components/SummaryMetrics'
import { BarChart } from '../components/charts/BarChart'
import { DonutChart } from '../components/charts/DonutChart'
import { SparklineChart } from '../components/charts/SparklineChart'
import type { Job } from '../types/job'
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
}

const formatSalary = (value: number, currency: string): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return '—'
  }
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch (error) {
    return `${currency} ${value.toLocaleString()}`
  }
}

export const AnalyticsPage = ({
  jobs,
  metrics,
  companyActivity,
  locationActivity,
  locationRemoteStats,
  industryBreakdown,
  salaryBenchmarks,
  remoteSplit,
  postingTrends,
  skillFrequency,
  isLoading,
  error,
}: AnalyticsPageProps) => (
  <main className="py-4 py-md-5">
    <div className="container-lg">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Talent market analytics</h1>
          <p className="text-body-secondary mb-0">
            {isLoading
              ? 'Refreshing insights from the latest roles feed…'
              : `${jobs.length} listings processed. Review velocity, remote adoption, salary benchmarks and geographic coverage.`}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/" className="btn btn-outline-primary fw-semibold">
            Back to jobs board
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 shadow-sm" role="alert">
          <h2 className="h5">Analytics are temporarily unavailable</h2>
          <p className="mb-0">{error}</p>
        </div>
      )}

      <section className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
          <div>
            <h2 className="h4 fw-bold mb-2">Market snapshot</h2>
            <p className="text-body-secondary mb-0">
              Totals across the active dataset. Trends auto-refresh whenever the data feed updates.
            </p>
          </div>
          <div className="text-lg-end text-body-secondary small">
            Last refreshed {isLoading ? '…' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}
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

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <section className="bg-white rounded-4 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 className="h5 fw-bold mb-1">Hiring velocity</h2>
                <p className="text-body-secondary small mb-0">
                  Weekly postings for the past quarter with remote contributions highlighted.
                </p>
              </div>
              <span className="badge bg-primary-subtle text-primary-emphasis">{postingTrends.length} weeks</span>
            </div>
            <SparklineChart
              data={postingTrends.map((point) => ({ label: point.label, value: point.total }))}
              ariaLabel="Weekly job posting trend"
            />
            <div className="mt-3">
              <BarChart
                data={postingTrends
                  .slice(-5)
                  .map((point) => ({ label: point.label, value: point.total, secondaryValue: point.remote }))}
                condensed
                showValues
                ariaLabel="Remote versus total postings for recent weeks"
              />
            </div>
          </section>
        </div>
        <div className="col-12 col-lg-6">
          <section className="bg-white rounded-4 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 className="h5 fw-bold mb-1">Remote adoption</h2>
                <p className="text-body-secondary small mb-0">
                  Share of listings marked as remote, on-site, or unspecified.
                </p>
              </div>
            </div>
            <DonutChart segments={remoteSplit.map((segment) => ({ label: segment.label, value: segment.count }))} ariaLabel="Remote adoption split" />
          </section>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          <section className="bg-white rounded-4 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 className="h5 fw-bold mb-1">Salary benchmarks by currency</h2>
                <p className="text-body-secondary small mb-0">
                  Midpoint averages based on roles that disclose salary ranges.
                </p>
              </div>
            </div>
            {salaryBenchmarks.length === 0 ? (
              <p className="text-body-secondary mb-0">No salary data available from the current dataset.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Currency</th>
                      <th scope="col" className="text-end">
                        Roles
                      </th>
                      <th scope="col" className="text-end">
                        Avg midpoint
                      </th>
                      <th scope="col" className="text-end">
                        Range
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryBenchmarks.map((benchmark) => (
                      <tr key={benchmark.currency}>
                        <th scope="row">{benchmark.currency}</th>
                        <td className="text-end">{benchmark.roles}</td>
                        <td className="text-end">{formatSalary(Math.round(benchmark.average), benchmark.currency)}</td>
                        <td className="text-end">
                          {formatSalary(benchmark.minimum, benchmark.currency)} –{' '}
                          {formatSalary(benchmark.maximum, benchmark.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
        <div className="col-12 col-xl-6">
          <section className="bg-white rounded-4 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 className="h5 fw-bold mb-1">Industry momentum</h2>
                <p className="text-body-secondary small mb-0">
                  Top sectors currently investing in data engineering talent and their remote share.
                </p>
              </div>
            </div>
            <BarChart
              data={industryBreakdown.map((item) => ({
                label: item.industry,
                value: item.roles,
                secondaryValue: Math.round(item.remoteShare * item.roles),
              }))}
              ariaLabel="Industry hiring volume with remote roles highlighted"
            />
          </section>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          <section className="bg-white rounded-4 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 className="h5 fw-bold mb-1">Most active companies</h2>
                <p className="text-body-secondary small mb-0">
                  Ranked by postings published in the last two weeks.
                </p>
              </div>
            </div>
            <BarChart
              data={companyActivity.slice(0, 12).map((item) => ({ label: item.company, value: item.count }))}
              ariaLabel="Companies ranked by job postings"
              condensed
            />
          </section>
        </div>
        <div className="col-12 col-xl-6">
          <section className="bg-white rounded-4 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 className="h5 fw-bold mb-1">Location coverage</h2>
                <p className="text-body-secondary small mb-0">
                  Remote mix and totals for the busiest hiring locations.
                </p>
              </div>
            </div>
            {locationRemoteStats.length === 0 ? (
              <p className="text-body-secondary mb-0">No locations available from the current dataset.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Location</th>
                      <th scope="col" className="text-end">
                        Roles
                      </th>
                      <th scope="col" className="text-end">
                        Remote share
                      </th>
                      <th scope="col" className="text-end">
                        Remote
                      </th>
                      <th scope="col" className="text-end">
                        On-site
                      </th>
                      <th scope="col" className="text-end">
                        Unspecified
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationRemoteStats.map((item) => (
                      <tr key={item.location}>
                        <th scope="row">{item.location}</th>
                        <td className="text-end">{item.total}</td>
                        <td className="text-end">{Math.round(item.remoteShare * 100)}%</td>
                        <td className="text-end">{item.remote}</td>
                        <td className="text-end">{item.onsite}</td>
                        <td className="text-end">{item.unknown}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
        <h2 className="h4 fw-bold mb-3">Most in-demand skills</h2>
        <p className="text-body-secondary mb-4">
          Aggregated across every live listing. Highlighted skills appear most often in job descriptions.
        </p>
        {skillFrequency.length === 0 ? (
          <p className="text-body-secondary mb-0">No skill data available.</p>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {skillFrequency.slice(0, 24).map((skill) => (
              <span
                key={skill.skill}
                className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-2"
              >
                {skill.skill}
                <span className="ms-1 text-body-secondary small">({skill.count})</span>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-4 shadow-sm p-4 p-lg-5">
        <h2 className="h4 fw-bold mb-3">Top hiring locations</h2>
        <p className="text-body-secondary mb-4">
          Where demand is strongest based on the current dataset.
        </p>
        {locationActivity.length === 0 ? (
          <p className="text-body-secondary mb-0">No locations available from the current dataset.</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 g-3">
            {locationActivity.map((item) => (
              <div className="col" key={item.location}>
                <div className="border rounded-4 p-3 h-100 bg-light-subtle">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">{item.location}</span>
                    <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-2">
                      {item.count} roles
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  </main>
)
