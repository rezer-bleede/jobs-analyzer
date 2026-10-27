import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Calendar, DollarSign, MapPin } from 'lucide-react'
import type { Job } from '../types/job'
import { formatJobDate, formatRemote, formatSalaryRange } from '../utils/jobFormat'

const MAX_SKILLS = 3

export const JobListItem = memo(({ job }: { job: Job }) => {
  const salaryLabel = formatSalaryRange(job)
  const skills = job.techSkills.slice(0, MAX_SKILLS)
  const extraSkills = job.techSkills.length - skills.length
  const detailsHref = `/jobs/${encodeURIComponent(job.id)}`

  return (
    <article className="job-row">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              <Link to={detailsHref} className="job-title-link">
                {job.title}
              </Link>
            </h3>
            <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{job.company}</span>
            <span className="badge badge-secondary">{job.source ?? 'External'}</span>
            <span className={`badge ${job.isRemote === true ? 'badge-success' : 'badge-accent'}`}>
              {formatRemote(job)}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            {salaryLabel && (
              <span className="hidden sm:flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" />
                {salaryLabel}
              </span>
            )}
            {job.jobType && (
              <span className="hidden sm:inline font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                {job.jobType}
              </span>
            )}
            {job.postingDate && (
              <span className="hidden md:flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatJobDate(job.postingDate)}
              </span>
            )}
            {skills.length > 0 && (
              <span className="hidden lg:flex flex-wrap items-center gap-1">
                {skills.map((skill) => (
                  <span key={skill} className="badge badge-primary">
                    {skill}
                  </span>
                ))}
                {extraSkills > 0 && <span className="badge badge-secondary">+{extraSkills}</span>}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            to={detailsHref}
            className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Details
          </Link>
          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${job.title} on ${job.source ?? 'source'}`}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
})

JobListItem.displayName = 'JobListItem'
