import { MapPin, Calendar, DollarSign, ExternalLink } from 'lucide-react'
import type { Job } from '../types/job'

const formatDate = (value?: string | null): string => {
  if (!value) return 'Date not provided'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Date not provided'
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
  if (skills.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="badge badge-primary">
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
    job.isRemote === true ? 'Remote' : job.isRemote === false ? 'On-site' : 'Hybrid'

  return (
    <article className="job-card bg-white dark:bg-slate-900 rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge badge-secondary text-xs uppercase font-semibold">
                {job.source ?? 'External'}
              </span>
              <span className={`badge text-xs font-semibold ${job.isRemote === true ? 'badge-success' : 'badge-accent'}`}>
                {remoteLabel}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">{job.title}</h3>
            <p className="text-slate-600 dark:text-slate-300 font-medium">{job.company}</p>
          </div>
          <div className="sm:text-right flex flex-col gap-1 text-sm text-slate-500 dark:text-slate-400">
            {job.jobType && (
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                {job.jobType}
              </span>
            )}
            <div className="flex items-center gap-1.5 sm:justify-end">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(job.postingDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          {salaryLabel && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <DollarSign className="w-4 h-4" />
              <span>{salaryLabel}</span>
            </div>
          )}
        </div>

        {job.summary && (
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">{job.summary}</p>
        )}

        {renderSkills(job.techSkills, 'Key technologies')}
        {renderSkills(job.domainSkills, 'Domain expertise')}

        <div className="mt-auto pt-4 flex flex-wrap gap-3 items-center">
          {job.jobUrl && (
            <a
              className="btn-primary inline-flex items-center gap-2 text-sm"
              href={job.jobUrl}
              target="_blank"
              rel="noreferrer"
            >
              View role
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {job.requirements && (
            <span className="text-slate-500 dark:text-slate-400 text-sm italic line-clamp-1 flex-1">
              {job.requirements.length > 100 ? `${job.requirements.slice(0, 97).trimEnd()}...` : job.requirements}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
