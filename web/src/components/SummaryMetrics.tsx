interface SummaryMetricsProps {
  totalJobs: number
  remoteJobs: number
  companies: number
  countries: number
  isLoading: boolean
}

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="col">
    <div className="card border-0 shadow-sm rounded-4 h-100 bg-gradient bg-opacity-10 bg-primary-subtle">
      <div className="card-body">
        <p className="text-uppercase small fw-semibold text-primary mb-2">{label}</p>
        <p className="display-6 fw-bold text-primary mb-0">{value}</p>
      </div>
    </div>
  </div>
)

export const SummaryMetrics = ({
  totalJobs,
  remoteJobs,
  companies,
  countries,
  isLoading,
}: SummaryMetricsProps) => (
  <section className="mb-4">
    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3">
      <MetricCard label="Live opportunities" value={isLoading ? '—' : totalJobs.toString()} />
      <MetricCard label="Remote roles" value={isLoading ? '—' : remoteJobs.toString()} />
      <MetricCard label="Hiring companies" value={isLoading ? '—' : companies.toString()} />
      <MetricCard label="Countries" value={isLoading ? '—' : countries.toString()} />
    </div>
  </section>
)
