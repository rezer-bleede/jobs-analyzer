import type { EmployerRecord } from '../types/employer'

export const fetchEmployers = async (): Promise<EmployerRecord[]> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}api/employers`)
    if (!response.ok) return []
    const payload = await response.json() as { employers?: unknown }
    if (!Array.isArray(payload.employers)) return []
    return payload.employers.filter((record): record is EmployerRecord =>
      Boolean(record && typeof record === 'object' && typeof (record as EmployerRecord).company_name === 'string'),
    )
  } catch {
    return []
  }
}
