import type { CompanyIdentity } from '../types/companyIdentity'

export const fetchCompanyIdentities = async (): Promise<CompanyIdentity[]> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}api/company-identities`)
    if (!response.ok) return []
    const payload: unknown = await response.json()
    if (!Array.isArray(payload)) return []
    return payload.filter((item): item is CompanyIdentity =>
      Boolean(item && typeof item === 'object'
        && Number.isInteger((item as CompanyIdentity).canonical_id)
        && typeof (item as CompanyIdentity).canonical_label === 'string'),
    )
  } catch {
    return []
  }
}
