import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { JobListItem } from '../components/JobListItem'
import { JobTable } from '../components/JobTable'
import type { Job } from '../types/job'

const job: Job = {
  id: 'job-123',
  title: 'Data Engineer',
  company: 'Example Co',
  location: 'Riyadh',
  source: 'Company',
  jobUrl: 'https://example.com/jobs/job-123',
  isRemote: false,
  techSkills: [],
  softSkills: [],
  domainSkills: [],
  raw: {},
}

describe('Job result rows', () => {
  it.each([
    ['table', <JobTable jobs={[job]} />],
    ['list', <JobListItem job={job} />],
  ])('opens job details from a %s row without hijacking external links', (_view, row) => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={row} />
          <Route path="/jobs/:jobId" element={<p>Job details</p>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Open Data Engineer on Company' }))
    expect(screen.queryByText('Job details')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Riyadh'))

    expect(screen.getByText('Job details')).toBeInTheDocument()
  })
})
