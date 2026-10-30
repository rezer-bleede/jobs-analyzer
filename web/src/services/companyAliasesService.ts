import type { CompanyAlias } from '../types/companyAlias'

export const fetchCompanyAliases = async (): Promise<CompanyAlias[]> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}api/company-aliases`)
    if (!response.ok) return []
    const payload: unknown = await response.json()
    if (!Array.isArray(payload)) return []
    return payload.filter((item): item is CompanyAlias =>
      Boolean(item && typeof item === 'object'
        && typeof (item as CompanyAlias).raw_value === 'string'
        && Number.isInteger((item as CompanyAlias).canonical_id)
        && (item as CompanyAlias).canonical_id > 0
        && typeof (item as CompanyAlias).canonical_label === 'string'),
    )
  } catch {
    return []
  }
}
