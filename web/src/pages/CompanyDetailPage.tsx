import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Users,
  Clock,
  Globe,
  DollarSign,
  Calendar,
  Layers,
} from 'lucide-react'
import { DataFreshness } from '../components/DataFreshness'
import { JobCollection } from '../components/JobCollection'
import { JobViewToggle } from '../components/JobViewToggle'
import { useJobView } from '../hooks/useJobView'
import type { Job } from '../types/job'
import type { EmployerRecord } from '../types/employer'
import type { JobsMetadata } from '../types/metadata'
import { buildCompanies, type CompanyInfo } from '../utils/companies'

interface CompanyDetailPageProps {
  jobs: Job[]
  employers: EmployerRecord[]
  isLoading: boolean
  error: string | null
  metadata: JobsMetadata | null
}

const formatSalary = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

const formatDate = (value: string | null): string => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const externalUrl = (value: string): string | undefined => {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

export const CompanyDetailPage = ({ jobs, employers, isLoading, error, metadata }: CompanyDetailPageProps) => {
  const { companyName } = useParams<{ companyName: string }>()
  const decodedName = companyName ? decodeURIComponent(companyName) : ''
  const [view, setView] = useJobView()

  const company: CompanyInfo | undefined = useMemo(() => {
    if (!decodedName) return undefined
    const companies = buildCompanies(jobs, employers)
    return companies.find(c => c.name === decodedName)
  }, [jobs, employers, decodedName])

  const companyJobs = useMemo(() => {
    if (!decodedName) return []
    return jobs.filter(j => j.company.trim() === decodedName)
  }, [jobs, decodedName])

  const techSkillFrequency = useMemo(() => {
    const freq = new Map<string, number>()
    for (const job of companyJobs) {
      for (const skill of job.techSkills) {
        freq.set(skill, (freq.get(skill) || 0) + 1)
      }
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1])
  }, [companyJobs])

  const domainSkillFrequency = useMemo(() => {
    const freq = new Map<string, number>()
    for (const job of companyJobs) {
      for (const skill of job.domainSkills) {
        freq.set(skill, (freq.get(skill) || 0) + 1)
      }
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1])
  }, [companyJobs])

  const softSkillFrequency = useMemo(() => {
    const freq = new Map<string, number>()
    for (const job of companyJobs) {
      for (const skill of job.softSkills) {
        freq.set(skill, (freq.get(skill) || 0) + 1)
      }
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1])
  }, [companyJobs])

  const salaryByRole = useMemo(() => {
    return companyJobs
      .filter(j => j.minSalary && j.maxSalary && j.currency)
      .map(j => ({
        title: j.title,
        min: j.minSalary!,
        max: j.maxSalary!,
        currency: j.currency!,
      }))
  }, [companyJobs])

  if (isLoading) {
    return (
      <main className="py-3 lg:py-4">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin" />
          </div>
        </div>
      </main>
    )
  }

  if (!company) {
    return (
      <main className="py-3 lg:py-4">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-card text-center py-12">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Company not found</h2>
            <p className="text-slate-500 dark:text-slate-300 mb-4">
              No data found for "{decodedName}".
            </p>
            <Link to="/companies" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to companies
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const maxSkillCount = techSkillFrequency.length > 0 ? techSkillFrequency[0][1] : 1
  const employer = company.employer
  const hasSalaryDisplay = Boolean(company.hasSalaryData && company.avgMinSalary && company.avgMaxSalary && company.salaryCurrency)
  const employerDetails = [
    ['Company website', employer?.company_url ?? company.website],
    ['Official domain', employer?.domain],
    ['Company description', company.description],
    ['Industry', employer?.industry ?? company.industries.join(', ')],
    ['Jobs seen', employer?.jobs_seen],
    ['Data & AI jobs (90 days)', employer?.data_ai_jobs_90d],
    ['Cities', (employer?.cities?.length ? employer.cities : company.locations).join(', ')],
    ['Sources', (employer?.sources?.length ? employer.sources : company.sources).join(', ')],
    ['GLEIF legal name', employer?.legal_name],
    ['LEI', employer?.lei],
    ['Commercial registration', employer?.commercial_registration_number],
    ['Registration authority', employer?.registration_authority],
    ['Legal status', employer?.legal_status],
    ['Registered / HQ location', [employer?.legal_city, employer?.legal_region, employer?.headquarters].filter(Boolean).join(' · ')],
    ['GLEIF parent', [employer?.parent_legal_name, employer?.parent_lei].filter(Boolean).join(' · ')],
    ['Wikidata ID', employer?.wikidata_id],
    ['Careers.sa openings', employer?.careers_sa_url ? `${employer.careers_sa_open_jobs ?? 0} (${employer.careers_sa_url})` : undefined],
    ['Hugging Face activity', employer?.is_ai_active ? `${employer.hf_model_count ?? 0} models · ${employer.hf_dataset_count ?? 0} datasets · ${(employer.hf_downloads ?? 0).toLocaleString()} downloads` : undefined],
  ].filter(([, value]) => value != null && value !== '') as [string, string | number][]

  return (
    <main className="py-3 lg:py-4">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-start gap-3 mb-3">
          <div>
            <Link
              to="/companies"
              className="inline-flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 hover:underline mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to companies
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
                {company.industries.length > 0 && (
                  <p className="text-slate-500 dark:text-slate-300 text-sm mt-0.5">{company.industries.join(' · ')}</p>
                )}
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-300">
            <DataFreshness metadata={metadata} isLoading={isLoading} />
          </div>
        </header>

        {error && (
          <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {employerDetails.length > 0 && (
          <section className="section-card mb-3" aria-labelledby="employer-sources-heading">
            <h2 id="employer-sources-heading" className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Company information & source signals
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              {employerDetails.map(([label, value]) => {
                const href = label === 'Company website'
                  ? externalUrl(String(value))
                  : label === 'Official domain'
                    ? externalUrl(String(value))
                  : label === 'Careers.sa openings'
                    ? externalUrl(String(value).match(/\((.*?)\)$/)?.[1] ?? '')
                    : undefined
                return (
                  <div key={label}>
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-medium break-words">
                      {href ? <a href={href} target="_blank" rel="noreferrer" className="text-violet-600 dark:text-violet-400 underline">{value}</a> : value}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div className="metric-card flex items-center gap-2">
            <Users className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{company.jobCount}</p>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Open Roles</span>
          </div>
          <div className="metric-card flex items-center gap-2">
            <Globe className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{company.locations.length}</p>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Locations</span>
          </div>
          <div className="metric-card flex items-center gap-2">
            <Briefcase className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{company.remoteCount}</p>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Remote <span className="text-sm font-normal">· {company.onsiteCount} on-site</span>
            </span>
          </div>
          <div className="metric-card flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatDate(company.latestPostingDate)}</p>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Latest Post</span>
          </div>
        </div>

        {/* Salary & Overview Row */}
        <div className={`grid grid-cols-1 gap-3 mb-3 ${hasSalaryDisplay ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          {/* Salary Info */}
          {hasSalaryDisplay && <div className="section-card">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Salary Information
            </h2>
            <div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1">Average Range</p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatSalary(company.avgMinSalary!, company.salaryCurrency!)} – {formatSalary(company.avgMaxSalary!, company.salaryCurrency!)}
                  </p>
                </div>
                {salaryByRole.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-2">By Role</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {salaryByRole.map((r, i) => (
                        <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                          <span className="text-slate-700 dark:text-slate-300 truncate mr-3">{r.title}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                            {formatSalary(r.min, r.currency)} – {formatSalary(r.max, r.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>}

          {/* Locations & Job Types */}
          <div className="section-card">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-violet-500" />
              Locations & Job Types
            </h2>
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-2">Countries</p>
              <div className="flex flex-wrap gap-1.5">
                {company.countries.map(c => (
                  <span key={c} className="badge badge-secondary text-xs">{c}</span>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-2">Locations</p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {company.locations.map(l => (
                  <span key={l} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">{l}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-2">Job Types</p>
              <div className="flex flex-wrap gap-1.5">
                {company.jobTypes.map(t => (
                  <span key={t} className="badge badge-accent text-xs">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Analysis */}
        {(techSkillFrequency.length > 0 || domainSkillFrequency.length > 0 || softSkillFrequency.length > 0) && <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Tech Skills */}
          {techSkillFrequency.length > 0 && <div className="section-card">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-500" />
              Tech Skills
            </h2>
            {techSkillFrequency.length > 0 ? (
              <div className="space-y-2">
                {techSkillFrequency.map(([skill, count]) => (
                  <div key={skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 dark:text-slate-300">{skill}</span>
                      <span className="text-slate-500 dark:text-slate-400">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full gradient-primary"
                        style={{ width: `${(count / maxSkillCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>}

          {/* Domain Skills */}
          {domainSkillFrequency.length > 0 && <div className="section-card">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-500" />
              Domain Skills
            </h2>
            {domainSkillFrequency.length > 0 ? (
              <div className="space-y-2">
                {domainSkillFrequency.map(([skill, count]) => {
                  const max = domainSkillFrequency[0][1]
                  return (
                    <div key={skill}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700 dark:text-slate-300">{skill}</span>
                        <span className="text-slate-500 dark:text-slate-400">{count}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full gradient-accent"
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>}

          {/* Soft Skills */}
          {softSkillFrequency.length > 0 && <div className="section-card">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Soft Skills
            </h2>
            {softSkillFrequency.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {softSkillFrequency.map(([skill, count]) => (
                  <span key={skill} className="badge badge-secondary text-xs">
                    {skill} <span className="ml-1 opacity-60">({count})</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>}
        </div>}

        {/* Job Titles Overview */}
        {company.jobTitles.length > 0 && <div className="section-card mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-violet-500" />
            Open Positions ({company.jobTitles.length} unique titles)
          </h2>
          <div className="flex flex-wrap gap-2">
            {company.jobTitles.map(title => (
              <span key={title} className="text-sm bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300">
                {title}
              </span>
            ))}
          </div>
        </div>}

        {/* All Job Listings */}
        <div className="mb-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-500" />
              All Job Listings ({companyJobs.length})
            </h2>
            <JobViewToggle view={view} onChange={setView} />
          </div>
          <JobCollection jobs={companyJobs} view={view} />
        </div>
      </div>
    </main>
  )
}
