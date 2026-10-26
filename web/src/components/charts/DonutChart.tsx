export interface DonutChartSegment { label: string; value: number; color?: string }
interface DonutChartProps { segments: DonutChartSegment[]; size?: number; strokeWidth?: number; showLegend?: boolean; ariaLabel?: string }

const COLORS = ['#3d6c49', '#879b8b', '#b8c4b9', '#d1a85b', '#8095a0', '#b77c69', '#5f7263']

export const DonutChart = ({ segments, size = 192, strokeWidth = 28, showLegend = true, ariaLabel }: DonutChartProps) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  if (!total) return <p className="text-slate-500 dark:text-slate-400">No data available.</p>
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0
  const chartSegments = segments.map((segment, index) => {
    const length = (segment.value / total) * circumference
    const result = { ...segment, color: segment.color ?? COLORS[index % COLORS.length], length, offset }
    offset += length
    return result
  })
  return <div className="flex flex-col items-center gap-6 lg:flex-row" aria-label={ariaLabel}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel ?? 'Distribution chart'} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-muted)" strokeWidth={strokeWidth} />
      {chartSegments.map((segment) => <circle key={segment.label} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={segment.color} strokeWidth={strokeWidth} strokeDasharray={`${segment.length} ${circumference - segment.length}`} strokeDashoffset={-segment.offset} />)}
    </svg>
    {showLegend && <div className="flex w-full flex-col gap-3">{chartSegments.map((segment) => <div key={segment.label} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2"><i className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: segment.color }} /><span className="truncate font-medium text-slate-700 dark:text-slate-300">{segment.label}</span></span><span className="text-slate-500 dark:text-slate-400">{((segment.value / total) * 100).toFixed(1)}%</span></div>)}</div>}
  </div>
}
