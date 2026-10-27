import { LayoutGrid, List, Table2 } from 'lucide-react'
import { JOB_VIEWS, type JobView } from '../hooks/useJobView'

const ICONS = {
  list: List,
  cards: LayoutGrid,
  table: Table2,
} as const

export const JobViewToggle = ({
  view,
  onChange,
}: {
  view: JobView
  onChange: (view: JobView) => void
}) => (
  <div
    role="group"
    aria-label="Job layout"
    className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5"
  >
    {JOB_VIEWS.map(({ value, label }) => {
      const Icon = ICONS[value]
      const isActive = view === value
      return (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={isActive}
          aria-label={label}
          title={label}
          className={`rounded-md p-1.5 transition-colors ${
            isActive
              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Icon className="w-4 h-4" />
        </button>
      )
    })}
  </div>
)
