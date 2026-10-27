import { useEffect, useState } from 'react'

export type JobView = 'list' | 'cards' | 'table'

export const JOB_VIEWS = [
  { value: 'list', label: 'List view' },
  { value: 'cards', label: 'Card view' },
  { value: 'table', label: 'Table view' },
] as const

const STORAGE_KEY = 'jobView'

const isJobView = (value: string | null): value is JobView =>
  JOB_VIEWS.some((option) => option.value === value)

export function useJobView() {
  const [view, setView] = useState<JobView>(() => {
    if (typeof window === 'undefined') return 'list'
    const stored = localStorage.getItem(STORAGE_KEY)
    return isJobView(stored) ? stored : 'list'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, view)
  }, [view])

  return [view, setView] as const
}
