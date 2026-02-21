interface SummaryMetricsProps {
  totalJobs: number
  remoteJobs: number
  companies: number
  countries: number
  isLoading: boolean
}

const MetricCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="metric-card">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-lg gradient-subtle flex items-center justify-center text-violet-600 dark:text-violet-400">
        {icon}
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
    </div>
    <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
  </div>
)

import { Briefcase, Globe, Building2, Wifi } from 'lucide-react'

export const SummaryMetrics = ({
  totalJobs,
  remoteJobs,
  companies,
  countries,
  isLoading,
}: SummaryMetricsProps) => (
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <MetricCard
      label="Live opportunities"
      value={isLoading ? '—' : totalJobs.toLocaleString()}
      icon={<Briefcase className="w-5 h-5" />}
    />
    <MetricCard
      label="Remote roles"
      value={isLoading ? '—' : remoteJobs.toLocaleString()}
      icon={<Wifi className="w-5 h-5" />}
    />
    <MetricCard
      label="Hiring companies"
      value={isLoading ? '—' : companies.toLocaleString()}
      icon={<Building2 className="w-5 h-5" />}
    />
    <MetricCard
      label="Countries"
      value={isLoading ? '—' : countries.toLocaleString()}
      icon={<Globe className="w-5 h-5" />}
    />
  </section>
)
