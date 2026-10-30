import { useMemo } from 'react'
import { AnalyticsPage } from './AnalyticsPage'
import type { Job } from '../types/job'
import type { JobsMetadata } from '../types/metadata'
import { buildSkillFrequency } from '../utils/skills'
import {
  buildCompanyActivity,
  buildIndustryBreakdown,
  buildLocationRemoteStats,
  buildPostingTrends,
  buildRemoteSplit,
  buildSalaryBenchmarks,
} from '../utils/analytics'

export interface AnalyticsRouteProps {
  jobs: Job[]
  isLoading: boolean
  error: string | null
  metadata: JobsMetadata | null
  metrics: { total: number; remote: number; companies: number; countries: number }
}

export const AnalyticsRoute = ({ jobs, isLoading, error, metadata, metrics }: AnalyticsRouteProps) => {
  const overallSkillFrequency = useMemo(() => buildSkillFrequency(jobs), [jobs])
  const companyActivity = useMemo(() => buildCompanyActivity(jobs), [jobs])
  const postingTrends = useMemo(() => buildPostingTrends(jobs, 12), [jobs])
  const remoteSplit = useMemo(() => buildRemoteSplit(jobs), [jobs])
  const salaryBenchmarks = useMemo(() => buildSalaryBenchmarks(jobs), [jobs])
  const industryBreakdown = useMemo(() => buildIndustryBreakdown(jobs), [jobs])
  const locationRemoteStats = useMemo(() => buildLocationRemoteStats(jobs, 10), [jobs])

  return (
    <AnalyticsPage
      metrics={metrics}
      companyActivity={companyActivity}
      locationRemoteStats={locationRemoteStats}
      industryBreakdown={industryBreakdown}
      salaryBenchmarks={salaryBenchmarks}
      remoteSplit={remoteSplit}
      postingTrends={postingTrends}
      skillFrequency={overallSkillFrequency}
      isLoading={isLoading}
      error={error}
      metadata={metadata}
    />
  )
}
