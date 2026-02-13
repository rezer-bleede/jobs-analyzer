import { useMemo } from 'react'
import type { JobsMetadata } from '../types/metadata'

interface DataFreshnessProps {
  metadata: JobsMetadata | null
  isLoading: boolean
}

export function DataFreshness({ metadata, isLoading }: DataFreshnessProps) {
  const freshness = useMemo(() => {
    if (!metadata?.lastUpdated) {
      return { status: 'unknown', label: 'Unknown', color: 'gray' }
    }

    const lastUpdated = new Date(metadata.lastUpdated)
    const now = new Date()
    const ageInHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)

    if (ageInHours < 24) {
      return { status: 'fresh', label: getTimeLabel(ageInHours), color: 'green' }
    } else if (ageInHours < 168) {
      return { status: 'recent', label: getTimeLabel(ageInHours), color: 'yellow' }
    } else {
      return { status: 'stale', label: getTimeLabel(ageInHours), color: 'red' }
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

  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  if (isLoading) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 animate-pulse">
        Loading data…
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[freshness.color as keyof typeof colorClasses]}`}
        title={metadata?.lastUpdated ? `Last updated: ${formatDate(metadata.lastUpdated)}` : 'Data freshness unknown'}
      >
        {freshness.status === 'fresh' && '🟢'}
        {freshness.status === 'recent' && '🟡'}
        {freshness.status === 'stale' && '🔴'}
        {freshness.status === 'unknown' && '⚪'}
        <span className="ml-1">{freshness.label}</span>
      </span>
    </div>
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
