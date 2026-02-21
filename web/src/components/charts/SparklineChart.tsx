import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts'

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

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-violet-600 dark:text-violet-400">{payload[0].value.toLocaleString()} postings</p>
      </div>
    )
  }
  return null
}

export const SparklineChart = ({ data, height = 100, ariaLabel }: SparklineChartProps) => {
  if (data.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400">No data available.</p>
  }

  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }))

  return (
    <div style={{ height }} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
