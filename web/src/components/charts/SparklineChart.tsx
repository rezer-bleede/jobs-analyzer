export interface SparklineDatum { label: string; value: number }
interface SparklineChartProps { data: SparklineDatum[]; height?: number; strokeColor?: string; ariaLabel?: string }

export const SparklineChart = ({ data, height = 100, strokeColor = '#3d6c49', ariaLabel }: SparklineChartProps) => {
  if (!data.length) return <p className="text-slate-500 dark:text-slate-400">No data available.</p>
  const width = 640
  const values = data.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * width},${height - 8 - ((value - min) / range) * (height - 16)}`).join(' ')
  const fillPoints = `0,${height} ${points} ${width},${height}`
  return <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel ?? 'Trend chart'} className="w-full" style={{ height }}>
    <polygon points={fillPoints} fill={strokeColor} opacity=".09" />
    <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}
