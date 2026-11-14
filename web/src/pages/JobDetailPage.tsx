import { ArrowLeft, ExternalLink, MapPin, CalendarDays, DollarSign } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { DataFreshness } from '../components/DataFreshness'
import type { Job } from '../types/job'
import type { JobsMetadata } from '../types/metadata'
import { parseSkillList } from '../utils/skills'

interface Props { jobs: Job[]; isLoading: boolean; error: string | null; metadata: JobsMetadata | null }

const supportsAutofill = (url?: string | null) => {
  try {
    return ['boards.greenhouse.io', 'job-boards.greenhouse.io', 'boards.eu.greenhouse.io', 'job-boards.eu.greenhouse.io']
      .includes(new URL(url ?? '').hostname)
  } catch {
    return false
  }
}

const dateLabel = (date?: string | null) => {
  if (!date || Number.isNaN(new Date(date).getTime())) return 'Date not provided'
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export const JobDetailPage = ({ jobs, isLoading, error, metadata }: Props) => {
  const { jobId } = useParams()
  const job = jobs.find((item) => item.id === jobId)

  if (isLoading) return <main className="mx-auto w-full max-w-[90rem] px-4 py-3 sm:px-6 lg:px-8"><p role="status">Loading role…</p></main>
  if (error || !job) return <main className="mx-auto w-full max-w-[90rem] px-4 py-3 sm:px-6 lg:px-8"><Link to="/" className="text-sm font-semibold text-violet-700 dark:text-violet-300">← Back to jobs</Link><section className="section-card mt-3"><h1 className="text-2xl font-bold">Role not found</h1><p className="mt-2 text-slate-600 dark:text-slate-400">This role may have expired or been removed.</p></section></main>

  const sourceText = `${job.title} ${job.industry ?? ''} ${job.summary ?? ''}`
  // ponytail: title-text Data/AI tags only; add a broader taxonomy when other topic groupings are needed.
  const topicTags = [
    /\bdata\b|\banalytics?\b|\bbusiness intelligence\b|\bdata warehouse\b|\bsap bw\b/i.test(sourceText) && 'Data',
    /\bai\b|\bartificial intelligence\b|\bmachine learning\b|\bml\b|\bdeep learning\b|\bllm\b/i.test(sourceText) && 'AI',
  ].filter((tag): tag is string => Boolean(tag))
  const tags = [...job.techSkills, ...job.domainSkills, ...job.softSkills, ...parseSkillList(job.domains ?? ''), ...topicTags]
    .filter((tag, index, all) => tag && all.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) === index)
  const salary = job.minSalary != null && job.maxSalary != null && job.currency
    ? `${job.minSalary.toLocaleString()} – ${job.maxSalary.toLocaleString()} ${job.currency}`
    : job.salary
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
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-secondary">{job.source ?? 'External'}</span>
              <span className="badge badge-secondary">{job.isRemote == null ? 'Workplace not specified' : job.isRemote ? 'Remote' : 'On-site'}</span>
              {job.jobType && <span className="badge badge-secondary">{job.jobType}</span>}
              {job.industry && <span className="badge badge-secondary">{job.industry}</span>}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{job.title}</h1>
            <p className="mt-2 text-lg font-medium text-slate-600 dark:text-slate-300">{job.company}</p>
            {job.companyUrl && <a className="mt-1 inline-flex items-center gap-1 text-sm text-violet-700 hover:underline dark:text-violet-300" href={job.companyUrl} target="_blank" rel="noreferrer">Company profile <ExternalLink size={14} /></a>}
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2"><MapPin size={16} />{job.location}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays size={16} />{dateLabel(job.postingDate)}</span>
              {salary && <span className="inline-flex items-center gap-2"><DollarSign size={16} />{salary}</span>}
            </div>
            {tags.length > 0 && <div className="mt-3"><p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Relevant tags</p><div className="flex flex-wrap gap-2">{tags.map((tag) => <span className="badge badge-secondary" key={tag}>{tag}</span>)}</div></div>}
          </header>
          <div className="mt-3 space-y-3">
            {sections.map(([title, content]) => <section className="section-card" key={title}><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 whitespace-pre-line leading-7 text-slate-600 dark:text-slate-300">{content}</p></section>)}
            {job.companyDescription && <section className="section-card"><h2 className="text-lg font-bold">About the company</h2><p className="mt-2 whitespace-pre-line leading-7 text-slate-600 dark:text-slate-300">{job.companyDescription}</p></section>}
            {sections.length === 0 && <section className="section-card"><h2 className="text-lg font-bold">Role description unavailable</h2><p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">No description or requirements were captured from the job listing.</p></section>}
          </div>
        </div>
        <aside className="section-card h-fit lg:sticky lg:top-24">
          <p className="text-sm text-slate-500 dark:text-slate-400">Interested in this role?</p>
          {job.jobUrl ? <a className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2" href={job.jobUrl} target="_blank" rel="noreferrer">Apply on company site <ExternalLink size={16} /></a> : <p className="mt-4 text-sm text-slate-500">Application link unavailable.</p>}
          {supportsAutofill(job.jobUrl) && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Greenhouse is supported by the optional browser extension for autofill and confirmed submission.</p>}
          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700"><DataFreshness metadata={metadata} isLoading={false} /></div>
        </aside>
      </article>
    </main>
  )
}
