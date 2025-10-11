export interface BarChartDatum {
  label: string
  value: number
  secondaryValue?: number
}

interface BarChartProps {
  data: BarChartDatum[]
  maxValue?: number
  showValues?: boolean
  ariaLabel?: string
  condensed?: boolean
}

const formatNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`
  }
  return value.toString()
}

export const BarChart = ({ data, maxValue, showValues = true, ariaLabel, condensed = false }: BarChartProps) => {
  if (data.length === 0) {
    return <p className="text-body-secondary mb-0">No data available.</p>
  }

  const resolvedMaxValue =
    maxValue ??
    data.reduce((acc, item) => {
      const candidate = item.secondaryValue ? Math.max(item.value, item.secondaryValue) : item.value
      return Math.max(acc, candidate)
    }, 0)

  const containerClass = `d-flex flex-column ${condensed ? 'gap-2' : 'gap-3'}`

  return (
    <div className={containerClass} role={ariaLabel ? 'list' : undefined} aria-label={ariaLabel}>
      {data.map((item) => {
        const valuePercentage = resolvedMaxValue > 0 ? Math.round((item.value / resolvedMaxValue) * 100) : 0
        const secondaryPercentage =
          item.secondaryValue !== undefined && resolvedMaxValue > 0
            ? Math.round((item.secondaryValue / resolvedMaxValue) * 100)
            : undefined

        return (
          <div key={item.label} role={ariaLabel ? 'listitem' : undefined}>
            <div className={`d-flex align-items-baseline justify-content-between ${condensed ? 'mb-1' : ''}`}>
              <span className="fw-semibold text-truncate me-3" title={item.label}>
                {item.label}
              </span>
              {showValues && (
                <span className="text-body-secondary small">
                  {formatNumber(item.value)}
                  {item.secondaryValue !== undefined && ` · ${formatNumber(item.secondaryValue)}`}
                </span>
              )}
            </div>
            <div className="position-relative bg-body-secondary bg-opacity-50 rounded-pill" style={{ height: condensed ? '0.5rem' : '0.75rem' }}>
              <div
                className="bg-primary rounded-pill"
                style={{ width: `${valuePercentage}%`, height: '100%', transition: 'width 0.3s ease' }}
                aria-hidden
              />
              {secondaryPercentage !== undefined && (
                <div
                  className="bg-success bg-opacity-75 rounded-pill position-absolute top-0"
                  style={{ width: `${secondaryPercentage}%`, height: '100%', transition: 'width 0.3s ease' }}
                  aria-hidden
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
