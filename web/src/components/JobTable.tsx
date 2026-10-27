import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Job } from '../types/job'
import { formatJobDate, formatRemote, formatSalaryRange } from '../utils/jobFormat'

const MAX_SKILLS = 3

export const JobTable = memo(({ jobs }: { jobs: Job[] }) => (
  <div className="job-card overflow-x-auto">
    <table className="table-modern">
      <caption className="sr-only">Job listings</caption>
      <thead>
        <tr>
          <th scope="col">Role</th>
          <th scope="col">Location</th>
          <th scope="col">Work mode</th>
          <th scope="col">Type</th>
          <th scope="col">Salary</th>
          <th scope="col">Posted</th>
          <th scope="col" className="hidden xl:table-cell">Skills</th>
          <th scope="col">
            <span className="sr-only">Links</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => {
          const salaryLabel = formatSalaryRange(job)
          const skills = job.techSkills.slice(0, MAX_SKILLS)
          const extraSkills = job.techSkills.length - skills.length

          return (
            <tr key={job.id}>
              <td className="min-w-72 whitespace-nowrap">
                <Link className="job-title-link font-semibold" to={`/jobs/${encodeURIComponent(job.id)}`}>
                  {job.title}
                </Link>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {job.company} · {job.source ?? 'External'}
                </div>
              </td>
              <td className="whitespace-nowrap">{job.location}</td>
              <td>
                <span className={`badge ${job.isRemote === true ? 'badge-success' : 'badge-accent'}`}>
                  {formatRemote(job)}
                </span>
              </td>
              <td className="whitespace-nowrap">{job.jobType ?? '—'}</td>
              <td className="whitespace-nowrap">{salaryLabel ?? '—'}</td>
              <td className="whitespace-nowrap">{job.postingDate ? formatJobDate(job.postingDate) : '—'}</td>
              <td className="hidden xl:table-cell">
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill) => (
                    <span key={skill} className="badge badge-primary">
                      {skill}
                    </span>
                  ))}
                  {extraSkills > 0 && <span className="badge badge-secondary">+{extraSkills}</span>}
                </div>
              </td>
              <td className="text-right">
                {job.jobUrl && (
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${job.title} on ${job.source ?? 'source'}`}
                    className="inline-flex rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
))

JobTable.displayName = 'JobTable'
