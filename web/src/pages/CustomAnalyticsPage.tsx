import { useMemo, useState } from 'react'
import type { Job } from '../types/job'
import { BarChart } from '../components/charts/BarChart'
import { DonutChart } from '../components/charts/DonutChart'

interface CustomAnalyticsPageProps {
  jobs: Job[]
  isLoading: boolean
  error: string | null
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

const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'table', label: 'Table' },
  { value: 'bar', label: 'Horizontal bar' },
  { value: 'donut', label: 'Donut' },
]

const normalizeLabel = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof value === 'boolean') {
    return value ? 'Remote' : 'On-site'
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeLabel(item)).filter(Boolean).join(', ') || null
  }
  return String(value)
}

const extractValues = (job: Job, field: GroupingField): string[] => {
  switch (field) {
    case 'company':
      return job.company ? [job.company] : []
    case 'country':
      return job.country ? [job.country] : []
    case 'location':
      return job.location ? [job.location] : []
    case 'jobType':
      return job.jobType ? [job.jobType] : []
    case 'industry':
      return job.industry ? [job.industry] : []
    case 'currency':
      return job.currency ? [job.currency] : []
    case 'source':
      return job.source ? [job.source] : []
    case 'isRemote':
      if (job.isRemote === true) {
        return ['Remote']
      }
      if (job.isRemote === false) {
        return ['On-site']
      }
      return ['Unspecified']
    case 'techSkills':
      return job.techSkills
    case 'softSkills':
      return job.softSkills
    default:
      return []
  }
}

const aggregateByField = (jobs: Job[], field: GroupingField, limit: number): AggregatedDatum[] => {
  const counts = new Map<string, number>()

  jobs.forEach((job) => {
    const values = extractValues(job, field)
    values.forEach((value) => {
      const label = normalizeLabel(value)
      if (!label) {
        return
      }
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
  if (field === 'isRemote') {
    return 'donut'
  }
  if (field === 'currency') {
    return 'table'
  }
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
    if (!selectedField) {
      return
    }
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
    <main className="py-4 py-md-5">
      <div className="container-lg">
        <header className="mb-4">
          <h1 className="h2 fw-bold mb-2">Custom analytics workspace</h1>
          <p className="text-body-secondary mb-0">
            Build bespoke charts and tables on top of the live dataset. Combine filters, grouping dimensions and visual styles
            to answer ad-hoc questions quickly.
          </p>
        </header>

        <section className="bg-white rounded-4 shadow-sm p-4 p-lg-5 mb-4">
          <h2 className="h4 fw-bold mb-3">Create a widget</h2>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label htmlFor="widget-field" className="form-label">
                Group by
              </label>
              <select
                id="widget-field"
                className="form-select"
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
              <div className="form-text">
                {GROUPING_OPTIONS.find((option) => option.value === selectedField)?.description}
              </div>
            </div>
            <div className="col-12 col-md-3">
              <label htmlFor="widget-chart" className="form-label">
                Visualisation
              </label>
              <select
                id="widget-chart"
                className="form-select"
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
            <div className="col-6 col-md-2">
              <label htmlFor="widget-limit" className="form-label">
                Rows
              </label>
              <input
                id="widget-limit"
                className="form-control"
                type="number"
                min={3}
                max={50}
                value={limit}
                onChange={(event) => setLimit(Math.max(3, Math.min(50, Number.parseInt(event.target.value, 10) || 10)))}
              />
            </div>
            <div className="col-6 col-md-3 d-grid">
              <button
                type="button"
                className="btn btn-primary btn-lg fw-semibold"
                onClick={handleAddWidget}
                disabled={isLoading || !hasData}
              >
                Add widget
              </button>
            </div>
          </div>
          {!hasData && !isLoading && (
            <p className="text-body-secondary small mb-0 mt-3">
              Widgets appear once the jobs dataset has been loaded.
            </p>
          )}
        </section>

        {error && (
          <div className="alert alert-danger rounded-4 shadow-sm" role="alert">
            <h2 className="h5">Unable to load jobs data</h2>
            <p className="mb-0">{error}</p>
          </div>
        )}

        <div className="d-flex flex-column gap-4">
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
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Value</th>
                        <th scope="col" className="text-end">
                          Roles
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item) => (
                        <tr key={item.label}>
                          <th scope="row">{item.label}</th>
                          <td className="text-end">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }

            return (
              <section key={widget.id} className="bg-white rounded-4 shadow-sm p-4 p-lg-5">
                <div className="d-flex flex-wrap gap-3 justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="h4 fw-bold mb-1">{getFieldLabel(widget.field)}</h2>
                    <p className="text-body-secondary small mb-0">
                      {GROUPING_OPTIONS.find((option) => option.value === widget.field)?.description}
                    </p>
                  </div>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <label className="form-label mb-0 me-2 text-body-secondary small" htmlFor={`chart-${widget.id}`}>
                      Visual
                    </label>
                    <select
                      id={`chart-${widget.id}`}
                      className="form-select form-select-sm"
                      value={widget.chartType}
                      onChange={(event) => updateWidget(widget.id, { chartType: event.target.value as ChartType })}
                    >
                      {CHART_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <label className="form-label mb-0 ms-3 me-2 text-body-secondary small" htmlFor={`limit-${widget.id}`}>
                      Rows
                    </label>
                    <input
                      id={`limit-${widget.id}`}
                      className="form-control form-control-sm"
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
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveWidget(widget.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {data.length === 0 ? (
                  <p className="text-body-secondary mb-0">No data available for this widget.</p>
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
