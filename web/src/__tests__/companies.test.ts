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

  it('groups only RefDataHub-approved aliases and leaves conflicts unmerged', () => {
    const secondJob = { ...job, id: '2', company: 'Acme LLC' }
    const companies = buildCompanies([job, secondJob], [
      { company_name: 'ACME LLC', lei: 'LEI-1' },
      { company_name: 'Shared Name', lei: 'LEI-2' },
    ], [
      { raw_value: 'Acme', canonical_id: 7, canonical_label: 'Acme Group' },
      { raw_value: 'Acme LLC', canonical_id: 7, canonical_label: 'Acme Group' },
      { raw_value: 'Shared Name', canonical_id: 7, canonical_label: 'Acme Group' },
      { raw_value: 'Shared Name', canonical_id: 8, canonical_label: 'Other Group' },
    ])

    expect(companies).toHaveLength(2)
    expect(companies.find(company => company.canonicalId === 7)).toMatchObject({
      name: 'Acme Group',
      jobCount: 2,
      employer: { lei: 'LEI-1' },
    })
    expect(companies.find(company => company.name === 'Shared Name')).toMatchObject({
      jobCount: 0,
      employer: { lei: 'LEI-2' },
    })
  })
})
