import { ArrowLeft, ExternalLink, MapPin, CalendarDays, DollarSign } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { DataFreshness } from '../components/DataFreshness'
import type { Job } from '../types/job'
import type { JobsMetadata } from '../types/metadata'

interface Props { jobs: Job[]; isLoading: boolean; error: string | null; metadata: JobsMetadata | null }

const dateLabel = (date?: string | null) => {
  if (!date || Number.isNaN(new Date(date).getTime())) return 'Date not provided'
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export const JobDetailPage = ({ jobs, isLoading, error, metadata }: Props) => {
  const { jobId } = useParams()
  const job = jobs.find((item) => item.id === jobId)

  if (isLoading) return <main className="mx-auto w-full max-w-[90rem] px-4 py-3 sm:px-6 lg:px-8"><p role="status">Loading role…</p></main>
  if (error || !job) return <main className="mx-auto w-full max-w-[90rem] px-4 py-3 sm:px-6 lg:px-8"><Link to="/" className="text-sm font-semibold text-violet-700 dark:text-violet-300">← Back to jobs</Link><section className="section-card mt-3"><h1 className="text-2xl font-bold">Role not found</h1><p className="mt-2 text-slate-600 dark:text-slate-400">This role may have expired or been removed.</p></section></main>

  const skills = [...job.techSkills, ...job.domainSkills]
  const salary = job.minSalary && job.maxSalary && job.currency
    ? `${job.minSalary.toLocaleString()} – ${job.maxSalary.toLocaleString()} ${job.currency}`
    : null
  const sections = [
    ['Role overview', job.summary],
    ['Requirements', job.requirements],
    ['Responsibilities', job.responsibilities],
    ['Benefits', job.benefits],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 py-3 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-700 dark:text-slate-300 dark:hover:text-violet-300"><ArrowLeft size={16} /> Back to jobs</Link>
      <article className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <header className="section-card">
            <div className="flex flex-wrap gap-2"><span className="badge badge-secondary">{job.source ?? 'External'}</span><span className="badge badge-secondary">{job.isRemote ? 'Remote' : job.isRemote === false ? 'On-site' : 'Hybrid'}</span></div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{job.title}</h1>
            <p className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-300">{job.company}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2"><MapPin size={16} />{job.location}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays size={16} />{dateLabel(job.postingDate)}</span>
              {salary && <span className="inline-flex items-center gap-2"><DollarSign size={16} />{salary}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{skills.map((skill) => <span className="badge badge-secondary" key={skill}>{skill}</span>)}</div>
          </header>
          <div className="mt-3 space-y-3">{sections.map(([title, content]) => <section className="section-card" key={title}><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 whitespace-pre-line leading-7 text-slate-600 dark:text-slate-300">{content}</p></section>)}</div>
        </div>
        <aside className="section-card h-fit lg:sticky lg:top-24">
          <p className="text-sm text-slate-500 dark:text-slate-400">Interested in this role?</p>
          {job.jobUrl ? <a className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2" href={job.jobUrl} target="_blank" rel="noreferrer">Apply on company site <ExternalLink size={16} /></a> : <p className="mt-4 text-sm text-slate-500">Application link unavailable.</p>}
          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700"><DataFreshness metadata={metadata} isLoading={false} /></div>
        </aside>
      </article>
    </main>
  )
}
