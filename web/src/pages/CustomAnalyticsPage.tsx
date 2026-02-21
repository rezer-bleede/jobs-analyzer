import { useMemo, useState } from 'react'
import { Plus, Trash2, TrendingUp, PieChart, Table } from 'lucide-react'
import type { Job } from '../types/job'
import type { JobsMetadata } from '../types/metadata'
import { BarChart } from '../components/charts/BarChart'
import { DonutChart } from '../components/charts/DonutChart'

interface CustomAnalyticsPageProps {
  jobs: Job[]
  isLoading: boolean
  error: string | null
  metadata: JobsMetadata | null
}

type GroupingField =
  | 'company'
  | 'country'
  | 'location'
  | 'jobType'
  | 'industry'
  | 'currency'
  | 'source'
  | 'isRemote'
  | 'techSkills'
  | 'softSkills'

type ChartType = 'table' | 'bar' | 'donut'

interface WidgetConfig {
  id: string
  field: GroupingField
  chartType: ChartType
  limit: number
}

interface AggregatedDatum {
  label: string
  value: number
}

const GROUPING_OPTIONS: { value: GroupingField; label: string; description: string }[] = [
  { value: 'company', label: 'Company', description: 'Hiring organisations ranked by volume.' },
  { value: 'country', label: 'Country', description: 'Geographic distribution using inferred country.' },
  { value: 'location', label: 'Location', description: 'City/state labels when available.' },
  { value: 'jobType', label: 'Job type', description: 'Full-time, contract and other job types.' },
  { value: 'industry', label: 'Industry', description: 'Company industry where provided.' },
  { value: 'currency', label: 'Salary currency', description: 'Which currencies appear alongside salary ranges.' },
  { value: 'source', label: 'Source', description: 'The job board or feed item originated from.' },
  { value: 'isRemote', label: 'Remote status', description: 'Remote vs on-site vs unspecified.' },
  { value: 'techSkills', label: 'Technical skills', description: 'Frequency of tech skills extracted from listings.' },
  { value: 'softSkills', label: 'Soft skills', description: 'Recurring soft skills mentioned in job descriptions.' },
]

const CHART_OPTIONS: { value: ChartType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'bar', label: 'Bar chart', icon: TrendingUp },
  { value: 'donut', label: 'Donut chart', icon: PieChart },
  { value: 'table', label: 'Table', icon: Table },
]

const normalizeLabel = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === 'boolean') return value ? 'Remote' : 'On-site'
  if (Array.isArray(value)) return value.map((item) => normalizeLabel(item)).filter(Boolean).join(', ') || null
  return String(value)
}

const extractValues = (job: Job, field: GroupingField): string[] => {
  switch (field) {
    case 'company': return job.company ? [job.company] : []
    case 'country': return job.country ? [job.country] : []
    case 'location': return job.location ? [job.location] : []
    case 'jobType': return job.jobType ? [job.jobType] : []
    case 'industry': return job.industry ? [job.industry] : []
    case 'currency': return job.currency ? [job.currency] : []
    case 'source': return job.source ? [job.source] : []
    case 'isRemote':
      if (job.isRemote === true) return ['Remote']
      if (job.isRemote === false) return ['On-site']
      return ['Unspecified']
    case 'techSkills': return job.techSkills
    case 'softSkills': return job.softSkills
    default: return []
  }
}

const aggregateByField = (jobs: Job[], field: GroupingField, limit: number): AggregatedDatum[] => {
  const counts = new Map<string, number>()

  jobs.forEach((job) => {
    const values = extractValues(job, field)
    values.forEach((value) => {
      const label = normalizeLabel(value)
      if (!label) return
      const current = counts.get(label) ?? 0
      counts.set(label, current + 1)
    })
  })

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit)
}

const getFieldLabel = (field: GroupingField): string => GROUPING_OPTIONS.find((option) => option.value === field)?.label ?? field

const getDefaultChartType = (field: GroupingField): ChartType => {
  if (field === 'isRemote') return 'donut'
  if (field === 'currency') return 'table'
  return 'bar'
}

export const CustomAnalyticsPage = ({ jobs, isLoading, error }: CustomAnalyticsPageProps) => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { id: 'default-company', field: 'company', chartType: 'bar', limit: 10 },
    { id: 'default-remote', field: 'isRemote', chartType: 'donut', limit: 5 },
  ])
  const [selectedField, setSelectedField] = useState<GroupingField>('country')
  const [selectedChart, setSelectedChart] = useState<ChartType>(getDefaultChartType('country'))
  const [limit, setLimit] = useState<number>(10)

  const hasData = jobs.length > 0

  const aggregatedData = useMemo(() => {
    const dataMap: Record<string, AggregatedDatum[]> = {}
    widgets.forEach((widget) => {
      dataMap[widget.id] = aggregateByField(jobs, widget.field, widget.limit)
    })
    return dataMap
  }, [jobs, widgets])

  const handleAddWidget = () => {
    if (!selectedField) return
    const widgetId = `${selectedField}-${Date.now()}`
    setWidgets((current) => [
      ...current,
      {
        id: widgetId,
        field: selectedField,
        chartType: selectedChart || getDefaultChartType(selectedField),
        limit: Math.max(3, Math.min(50, limit || 10)),
      },
    ])
  }

  const handleRemoveWidget = (id: string) => {
    setWidgets((current) => current.filter((widget) => widget.id !== id))
  }

  const updateWidget = (id: string, updates: Partial<WidgetConfig>) => {
    setWidgets((current) => current.map((widget) => (widget.id === id ? { ...widget, ...updates } : widget)))
  }

  return (
    <main className="py-6 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">Custom analytics workspace</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Build bespoke charts and tables on top of the live dataset. Combine filters, grouping dimensions and visual styles to answer ad-hoc questions quickly.
          </p>
        </header>

        <section className="section-card mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create a widget</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-4">
              <label htmlFor="widget-field" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Group by
              </label>
              <select
                id="widget-field"
                className="input-modern"
                value={selectedField}
                onChange={(event) => {
                  const field = event.target.value as GroupingField
                  setSelectedField(field)
                  setSelectedChart(getDefaultChartType(field))
                }}
              >
                {GROUPING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {GROUPING_OPTIONS.find((option) => option.value === selectedField)?.description}
              </p>
            </div>
            <div className="lg:col-span-3">
              <label htmlFor="widget-chart" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Visualisation
              </label>
              <select
                id="widget-chart"
                className="input-modern"
                value={selectedChart}
                onChange={(event) => setSelectedChart(event.target.value as ChartType)}
              >
                {CHART_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="widget-limit" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Rows
              </label>
              <input
                id="widget-limit"
                className="input-modern"
                type="number"
                min={3}
                max={50}
                value={limit}
                onChange={(event) => setLimit(Math.max(3, Math.min(50, Number.parseInt(event.target.value, 10) || 10)))}
              />
            </div>
            <div className="lg:col-span-3">
              <button
                type="button"
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={handleAddWidget}
                disabled={isLoading || !hasData}
              >
                <Plus className="w-4 h-4" />
                Add widget
              </button>
            </div>
          </div>
          {!hasData && !isLoading && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              Widgets appear once the jobs dataset has been loaded.
            </p>
          )}
        </section>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <h2 className="font-semibold text-red-800 dark:text-red-200 mb-1">Unable to load jobs data</h2>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {widgets.map((widget) => {
            const data = aggregatedData[widget.id] ?? []

            const renderContent = () => {
              if (widget.chartType === 'bar') {
                return <BarChart data={data} ariaLabel={`${getFieldLabel(widget.field)} bar chart`} />
              }
              if (widget.chartType === 'donut') {
                return (
                  <DonutChart
                    segments={data.map((item) => ({ label: item.label, value: item.value }))}
                    ariaLabel={`${getFieldLabel(widget.field)} donut chart`}
                  />
                )
              }
              return (
                <div className="overflow-x-auto">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Value</th>
                        <th className="text-right">Roles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item) => (
                        <tr key={item.label}>
                          <td className="font-medium">{item.label}</td>
                          <td className="text-right">{item.value.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }

            return (
              <section key={widget.id} className="section-card">
                <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{getFieldLabel(widget.field)}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {GROUPING_OPTIONS.find((option) => option.value === widget.field)?.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <label className="text-xs text-slate-500 dark:text-slate-400" htmlFor={`chart-${widget.id}`}>
                      Visual
                    </label>
                    <select
                      id={`chart-${widget.id}`}
                      className="input-modern text-sm py-1.5 px-3"
                      value={widget.chartType}
                      onChange={(event) => updateWidget(widget.id, { chartType: event.target.value as ChartType })}
                    >
                      {CHART_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <label className="text-xs text-slate-500 dark:text-slate-400 ml-2" htmlFor={`limit-${widget.id}`}>
                      Rows
                    </label>
                    <input
                      id={`limit-${widget.id}`}
                      className="input-modern text-sm py-1.5 px-3 w-16"
                      type="number"
                      min={3}
                      max={50}
                      value={widget.limit}
                      onChange={(event) =>
                        updateWidget(widget.id, {
                          limit: Math.max(3, Math.min(50, Number.parseInt(event.target.value, 10) || widget.limit)),
                        })
                      }
                    />
                    <button
                      type="button"
                      className="btn-ghost text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                      onClick={() => handleRemoveWidget(widget.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {data.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">No data available for this widget.</p>
                ) : (
                  renderContent()
                )}
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
