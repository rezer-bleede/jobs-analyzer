import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CompaniesPage } from '../pages/CompaniesPage'
import type { Job } from '../types/job'

const jobs: Job[] = [{
  id: 'job-1', title: 'Data Engineer', company: 'Acme', location: 'Riyadh, Saudi Arabia',
  country: 'Saudi Arabia', source: 'Board', isRemote: false,
  techSkills: ['Python'], softSkills: [], domainSkills: [], raw: {},
}]

describe('CompaniesPage layouts', () => {
  beforeEach(() => localStorage.clear())

  it('starts in the dense list layout and can switch to table', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CompaniesPage jobs={jobs} employers={[]} isLoading={false} error={null} metadata={null} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('group', { name: 'Company layout' })).toBeInTheDocument()
    expect(screen.getByText('Sources: Board')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Table view' }))

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Acme' })).toHaveAttribute('href', '/companies/Acme')
  })
})
