import { Link } from 'react-router-dom'
import { SummaryMetrics } from '../components/SummaryMetrics'
import type { Job } from '../types/job'
import type { SkillFrequency } from '../utils/skills'
import type { CompanyActivity, LocationActivity } from '../utils/analytics'

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
  skillFrequency: SkillFrequency[]
  isLoading: boolean
  error: string | null
}

export const AnalyticsPage = ({
  jobs,
  metrics,
  companyActivity,
  locationActivity,
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
            A live pulse of data engineering opportunities across the Middle East. Updated automatically from the latest
            job feed ({jobs.length} listings tracked).
          </p>
        </div>
        <Link to="/" className="btn btn-outline-primary btn-lg fw-semibold">
          Back to jobs board
        </Link>
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
            <h2 className="h4 fw-bold mb-2">General analytics</h2>
            <p className="text-body-secondary mb-0">
              Key indicators summarising live opportunities, remote coverage, and cross-country reach.
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

      <section className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
        <h2 className="h4 fw-bold mb-3">Most active companies hiring recently</h2>
        <p className="text-body-secondary mb-4">
          Ranked by postings published in the last two weeks. Use this shortlist to prioritise outreach.
        </p>
        {companyActivity.length === 0 ? (
          <p className="text-body-secondary mb-0">No recent hiring activity detected.</p>
        ) : (
          <ol className="list-group list-group-numbered">
            {companyActivity.slice(0, 10).map((item) => (
              <li
                key={item.company}
                className="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom py-3"
              >
                <span className="fw-semibold">{item.company}</span>
                <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-2">
                  {item.count} roles
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

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
          Where demand is strongest based on the current dataset. Useful for relocation planning and regional coverage.
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
