import { describe, expect, it } from 'vitest'
import type { EmployerRecord } from '../types/employer'
import type { Job } from '../types/job'
import { buildCompanies } from '../utils/companies'

const job: Job = {
  id: '1', title: 'Data Engineer', company: 'Acme', location: 'Riyadh', country: 'Saudi Arabia',
  isRemote: false, techSkills: [], softSkills: [], domainSkills: [], raw: {},
}

describe('buildCompanies employer records', () => {
  it('joins employer details and includes employer-only companies', () => {
    const employers: EmployerRecord[] = [
      { company_name: 'acme', lei: 'LEI-1', legal_name: 'Acme Saudi LLC' },
      { company_name: 'Directory Co', careers_sa_url: 'https://careers.sa/company/directory', careers_sa_open_jobs: 8 },
      { company_name: 'Identity Only', lei: 'LEI-2' },
    ]

    const companies = buildCompanies([job], employers)
    expect(companies).toHaveLength(3)
    expect(companies.find(company => company.name === 'Acme')).toMatchObject({
      jobCount: 1,
      employer: { lei: 'LEI-1', legal_name: 'Acme Saudi LLC' },
    })
    expect(companies.find(company => company.name === 'Directory Co')).toMatchObject({
      jobCount: 0,
      countries: ['Saudi Arabia'],
      employer: { careers_sa_open_jobs: 8 },
    })
    expect(companies.find(company => company.name === 'Identity Only')).toMatchObject({
      jobCount: 0,
      employer: { lei: 'LEI-2' },
    })
  })
})
