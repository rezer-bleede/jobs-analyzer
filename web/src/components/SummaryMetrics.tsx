import type { ReactNode } from 'react'
import { Briefcase, Globe, Building2, Wifi } from 'lucide-react'

interface SummaryMetricsProps {
  totalJobs: number
  remoteJobs: number
  companies: number
  countries: number
  isLoading: boolean
  freshness?: ReactNode
}

const MetricCard = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => (
  <div className="metric-card flex min-w-0 items-center gap-2">
    <span className="shrink-0 text-violet-600 dark:text-violet-400">{icon}</span>
    <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
  </div>
)

export const SummaryMetrics = ({
  totalJobs,
  remoteJobs,
  companies,
  countries,
  isLoading,
  freshness,
}: SummaryMetricsProps) => (
  <section className={`grid grid-cols-2 gap-2 mb-3 ${freshness ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
    <MetricCard
      label="Live opportunities"
      value={isLoading ? '—' : totalJobs.toLocaleString()}
      icon={<Briefcase className="w-4 h-4" />}
    />
    <MetricCard
      label="Remote roles"
      value={isLoading ? '—' : remoteJobs.toLocaleString()}
      icon={<Wifi className="w-4 h-4" />}
    />
    <MetricCard
      label="Hiring companies"
      value={isLoading ? '—' : companies.toLocaleString()}
      icon={<Building2 className="w-4 h-4" />}
    />
    <MetricCard
      label="Countries"
      value={isLoading ? '—' : countries.toLocaleString()}
      icon={<Globe className="w-4 h-4" />}
    />
    {freshness && <div className="metric-card col-span-2 flex items-center justify-center lg:col-span-1">{freshness}</div>}
  </section>
)
