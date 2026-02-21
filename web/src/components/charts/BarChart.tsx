import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts'

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

const COLORS = {
  primary: '#7c3aed',
  secondary: '#06b6d4',
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-slate-600 dark:text-slate-400">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const BarChart = ({ data, showValues = true, ariaLabel, condensed = false }: BarChartProps) => {
  if (data.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400">No data available.</p>
  }

  const chartData = data.map((item) => ({
    name: item.label.length > 20 ? `${item.label.slice(0, 17)}...` : item.label,
    fullName: item.label,
    value: item.value,
    secondaryValue: item.secondaryValue ?? 0,
  }))

  return (
    <div className={condensed ? 'h-48' : 'h-64'} role={ariaLabel ? 'list' : undefined} aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: showValues ? 60 : 20, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            width={condensed ? 100 : 140}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }} />
          <Bar
            dataKey="value"
            fill={COLORS.primary}
            radius={[0, 4, 4, 0]}
            barSize={condensed ? 16 : 24}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index < 3 ? COLORS.primary : '#a78bfa'}
              />
            ))}
          </Bar>
          {chartData.some((d) => d.secondaryValue > 0) && (
            <Bar
              dataKey="secondaryValue"
              fill={COLORS.secondary}
              radius={[0, 4, 4, 0]}
              barSize={condensed ? 16 : 24}
            />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
