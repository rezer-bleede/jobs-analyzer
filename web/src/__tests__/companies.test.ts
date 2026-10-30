import { describe, expect, it } from 'vitest'
import type { EmployerRecord } from '../types/employer'
import type { CompanyIdentity } from '../types/companyIdentity'
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

  it('matches an exact LinkedIn company page across localized LinkedIn hosts', () => {
    const identities: CompanyIdentity[] = [{
      canonical_id: 7,
      canonical_label: 'Acme Group',
      linkedin_company_url: 'https://www.linkedin.com/company/acme-group/',
    }]
    const companies = buildCompanies([{
      ...job,
      company: 'Acme Saudi',
      companyUrl: 'https://sa.linkedin.com/company/acme-group?trk=company',
    }], [], [], identities)

    expect(companies).toHaveLength(1)
    expect(companies[0]).toMatchObject({ name: 'Acme Group', canonicalId: 7, jobCount: 1 })
  })

  it('uses exact legal identifiers but rejects conflicting or parent identifiers', () => {
    const identities: CompanyIdentity[] = [
      { canonical_id: 7, canonical_label: 'Acme Group', lei: '5493001KJTIIGC8Y1R12' },
      { canonical_id: 8, canonical_label: 'Other Group', wikidata_id: 'Q1234' },
    ]
    const companies = buildCompanies([
      { ...job, company: 'Acme' },
      { ...job, id: '2', company: 'Conflicting Employer' },
      { ...job, id: '3', company: 'Subsidiary' },
    ], [
      { company_name: 'Acme', lei: '5493001KJTIIGC8Y1R12' },
      { company_name: 'Conflicting Employer', lei: '5493001KJTIIGC8Y1R12', wikidata_id: 'Q1234' },
      { company_name: 'Subsidiary', parent_lei: '5493001KJTIIGC8Y1R12' },
    ], [], identities)

    expect(companies.find(company => company.name === 'Acme Group')?.jobCount).toBe(1)
    expect(companies.find(company => company.name === 'Conflicting Employer')?.canonicalId).toBeUndefined()
    expect(companies.find(company => company.name === 'Subsidiary')?.canonicalId).toBeUndefined()
  })

  it('does not merge when an identity identifier points to multiple canonical companies', () => {
    const companies = buildCompanies([job], [], [], [
      { canonical_id: 7, canonical_label: 'Acme Group', lei: '5493001KJTIIGC8Y1R12' },
      { canonical_id: 8, canonical_label: 'Other Group', lei: '5493001KJTIIGC8Y1R12' },
    ])

    expect(companies).toHaveLength(1)
    expect(companies[0].canonicalId).toBeUndefined()
  })
})
