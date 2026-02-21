import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import type { JobsMetadata } from '../types/metadata'

interface DataFreshnessProps {
  metadata: JobsMetadata | null
  isLoading: boolean
}

export function DataFreshness({ metadata, isLoading }: DataFreshnessProps) {
  const freshness = useMemo(() => {
    if (!metadata?.lastUpdated) {
      return { status: 'unknown', label: 'Unknown', colorClass: 'bg-slate-100 text-slate-600 border-slate-200' }
    }

    const lastUpdated = new Date(metadata.lastUpdated)
    const now = new Date()
    const ageInHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)

    if (ageInHours < 24) {
      return { status: 'fresh', label: getTimeLabel(ageInHours), colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' }
    } else if (ageInHours < 168) {
      return { status: 'recent', label: getTimeLabel(ageInHours), colorClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' }
    } else {
      return { status: 'stale', label: getTimeLabel(ageInHours), colorClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' }
    }
  }, [metadata])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Unknown'
    }
  }

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 animate-pulse">
        <Clock className="w-3 h-3" />
        Loading...
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${freshness.colorClass}`}
      title={metadata?.lastUpdated ? `Last updated: ${formatDate(metadata.lastUpdated)}` : 'Data freshness unknown'}
    >
      <Clock className="w-3 h-3" />
      {freshness.label}
    </span>
  )
}

function getTimeLabel(ageInHours: number): string {
  if (ageInHours < 1) {
    const minutes = Math.round(ageInHours * 60)
    return `${minutes}m ago`
  } else if (ageInHours < 24) {
    const hours = Math.round(ageInHours)
    return `${hours}h ago`
  } else if (ageInHours < 168) {
    const days = Math.round(ageInHours / 24)
    return `${days}d ago`
  } else {
    const weeks = Math.round(ageInHours / 168)
    return `${weeks}w ago`
  }
}
