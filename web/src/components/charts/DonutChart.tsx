import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

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

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { percent: number } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-medium text-slate-900 dark:text-white">{payload[0].name}</p>
        <p className="text-slate-600 dark:text-slate-400">
          {payload[0].value.toLocaleString()} ({(payload[0].payload.percent * 100).toFixed(1)}%)
        </p>
      </div>
    )
  }
  return null
}

export const DonutChart = ({
  segments,
  showLegend = true,
  ariaLabel,
}: DonutChartProps) => {
  const total = segments.reduce((acc, item) => acc + item.value, 0)

  if (total === 0) {
    return <p className="text-slate-500 dark:text-slate-400">No data available.</p>
  }

  const chartData = segments.map((segment, index) => ({
    name: segment.label,
    value: segment.value,
    color: segment.color ?? COLORS[index % COLORS.length],
  }))

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6" aria-label={ariaLabel}>
      <div className="w-48 h-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {showLegend && (
        <div className="flex flex-col gap-3 w-full">
          {chartData.map((segment) => {
            const percentage = ((segment.value / total) * 100).toFixed(1)
            return (
              <div key={segment.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                    aria-hidden
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{segment.name}</span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">{percentage}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
