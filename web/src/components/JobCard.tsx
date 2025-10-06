import type { Job } from '../types/job'

const formatDate = (value?: string | null): string => {
  if (!value) {
    return 'Date not provided'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Date not provided'
  }
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatSalaryRange = (job: Job): string | null => {
  if (job.minSalary && job.maxSalary && job.currency) {
    return `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} ${job.currency}`
  }
  if (job.minSalary && job.currency) {
    return `From ${job.minSalary.toLocaleString()} ${job.currency}`
  }
  if (job.maxSalary && job.currency) {
    return `Up to ${job.maxSalary.toLocaleString()} ${job.currency}`
  }
  return null
}

const renderSkills = (skills: string[], label: string) => {
  if (skills.length === 0) {
    return null
  }

  return (
    <div className="mt-3">
      <p className="text-uppercase small fw-semibold text-secondary mb-2">{label}</p>
      <div className="d-flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="badge rounded-pill bg-primary-subtle text-primary-emphasis">
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}

export const JobCard = ({ job }: { job: Job }) => {
  const salaryLabel = formatSalaryRange(job)
  const remoteLabel =
    job.isRemote === true ? 'Remote friendly' : job.isRemote === false ? 'On-site' : 'Hybrid / flexible'

  return (
    <article className="card job-card shadow-sm border-0 h-100">
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-gradient rounded-pill text-uppercase small fw-semibold text-bg-secondary">
                {job.source ?? 'External'}
              </span>
              <span className="badge bg-info-subtle text-info-emphasis rounded-pill text-uppercase small fw-semibold">
                {remoteLabel}
              </span>
            </div>
            <h3 className="h4 mb-1">{job.title}</h3>
            <p className="mb-2 text-secondary fw-semibold">{job.company}</p>
            <p className="mb-0 text-body-secondary">{job.location}</p>
          </div>
          <div className="text-md-end">
            {job.jobType && <p className="mb-1 text-uppercase small fw-semibold text-secondary">{job.jobType}</p>}
            <p className="mb-1 text-body-secondary">Posted {formatDate(job.postingDate)}</p>
            {salaryLabel && <p className="mb-0 text-body-secondary">{salaryLabel}</p>}
          </div>
        </div>
        {job.summary && <p className="mt-3 text-body-secondary">{job.summary}</p>}
        {renderSkills(job.techSkills, 'Key technologies')}
        {renderSkills(job.domainSkills, 'Domain expertise')}
        <div className="mt-4 d-flex flex-wrap gap-3 align-items-center">
          {job.jobUrl && (
            <a className="btn btn-primary btn-lg" href={job.jobUrl} target="_blank" rel="noreferrer">
              View role
            </a>
          )}
          {job.requirements && (
            <span className="text-body-secondary small fst-italic">
              {job.requirements.length > 160
                ? `${job.requirements.slice(0, 157).trimEnd()}...`
                : job.requirements}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
