export interface DonutChartSegment {
  label: string
  value: number
  color?: string
}

interface DonutChartProps {
  segments: DonutChartSegment[]
  size?: number
  strokeWidth?: number
  showLegend?: boolean
  ariaLabel?: string
}

const defaultPalette = ['#0d6efd', '#20c997', '#ffc107', '#6610f2', '#fd7e14', '#6f42c1', '#dc3545']

export const DonutChart = ({
  segments,
  size = 160,
  strokeWidth = 22,
  showLegend = true,
  ariaLabel,
}: DonutChartProps) => {
  const total = segments.reduce((acc, item) => acc + item.value, 0)

  if (total === 0) {
    return <p className="text-body-secondary mb-0">No data available.</p>
  }

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let cumulativeOffset = 0

  return (
    <div className="d-flex flex-column flex-lg-row align-items-center gap-3" aria-label={ariaLabel}>
      <svg width={size} height={size} role="img" aria-hidden={!ariaLabel}>
        <title>{ariaLabel}</title>
        <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
          {segments.map((segment, index) => {
            const value = segment.value
            const normalizedValue = value / total
            const dashArray = normalizedValue * circumference
            const dashOffset = circumference - cumulativeOffset
            cumulativeOffset += dashArray

            return (
              <circle
                key={segment.label}
                r={radius}
                fill="transparent"
                stroke={segment.color ?? defaultPalette[index % defaultPalette.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashArray} ${circumference}`}
                strokeDashoffset={dashOffset}
              />
            )
          })}
        </g>
      </svg>
      {showLegend && (
        <div className="d-flex flex-column gap-2 w-100">
          {segments.map((segment, index) => {
            const percentage = ((segment.value / total) * 100).toFixed(1)
            const color = segment.color ?? defaultPalette[index % defaultPalette.length]
            return (
              <div key={segment.label} className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="rounded-2 d-inline-block"
                    style={{ width: '0.75rem', height: '0.75rem', backgroundColor: color }}
                    aria-hidden
                  />
                  <span className="fw-semibold text-truncate" title={segment.label}>
                    {segment.label}
                  </span>
                </div>
                <span className="text-body-secondary small">{percentage}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
