export interface BarChartDatum { label: string; value: number; secondaryValue?: number }
interface BarChartProps { data: BarChartDatum[]; maxValue?: number; showValues?: boolean; ariaLabel?: string; condensed?: boolean }

export const BarChart = ({ data, maxValue, showValues = true, ariaLabel, condensed = false }: BarChartProps) => {
  if (!data.length) return <p className="text-slate-500 dark:text-slate-400">No data available.</p>
  const max = maxValue ?? Math.max(...data.map((item) => Math.max(item.value, item.secondaryValue ?? 0)), 1)
  const rowHeight = condensed ? 28 : 36
  return <div className="space-y-2" role="img" aria-label={ariaLabel ?? 'Bar chart'}>
    {data.map((item, index) => <div key={`${item.label}-${index}`} className="grid items-center gap-3" style={{ gridTemplateColumns: `${condensed ? '6rem' : '8rem'} minmax(0,1fr) auto`, minHeight: rowHeight }}>
      <span className="truncate text-xs text-slate-600 dark:text-slate-300" title={item.label}>{item.label}</span>
      <span className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><span className="block h-full rounded-full bg-violet-600" style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }} /></span>
      {showValues && <span className="min-w-8 text-right text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">{item.value.toLocaleString()}</span>}
    </div>)}
  </div>
}
