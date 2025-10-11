export interface SparklineDatum {
  label: string
  value: number
}

interface SparklineChartProps {
  data: SparklineDatum[]
  height?: number
  strokeColor?: string
  ariaLabel?: string
}

export const SparklineChart = ({ data, height = 64, strokeColor = '#0d6efd', ariaLabel }: SparklineChartProps) => {
  if (data.length === 0) {
    return <p className="text-body-secondary mb-0">No data available.</p>
  }

  const width = data.length * 36
  const values = data.map((item) => item.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * width
      const y = height - ((item.value - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <figure className="mb-0" aria-label={ariaLabel}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden={!ariaLabel}>
        <title>{ariaLabel}</title>
        <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        {data.map((item, index) => {
          const x = (index / (data.length - 1 || 1)) * width
          const y = height - ((item.value - min) / range) * height
          return <circle key={item.label} cx={x} cy={y} r="4" fill={strokeColor} />
        })}
      </svg>
      <figcaption className="visually-hidden">{data.map((item) => `${item.label}: ${item.value}`).join(', ')}</figcaption>
    </figure>
  )
}
