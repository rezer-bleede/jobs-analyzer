import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { JobDetailPage } from '../pages/JobDetailPage'
import { normaliseJobs } from '../services/jobsService'

describe('JobDetailPage', () => {
  it('shows available listing details and relevant tags without inventing work mode', () => {
    const jobs = normaliseJobs([{
      job_hash: '2856928188',
      title: 'SAP BW & Analytics Services Team Lead',
      company: 'alfanar',
      location: 'Riyadh, Riyadh, Saudi Arabia',
      date_posted: '2026-10-31',
      is_remote: null,
      job_type_inferred: 'Full-time',
      salary_inferred: 'SAR 25,000 per month',
      company_industry: 'Information Technology',
      company_url: 'https://example.com/company',
      desired_tech_skills_inferred: 'AI, SAP BW',
      desired_soft_skills_inferred: 'Leadership',
      domains_inferred: 'Analytics, Data',
      job_url: 'https://boards.greenhouse.io/acme/jobs/123',
    }])

    render(
      <MemoryRouter initialEntries={['/jobs/2856928188']}>
        <Routes>
          <Route path="/jobs/:jobId" element={<JobDetailPage jobs={jobs} isLoading={false} error={null} metadata={null} />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Full-time')).toBeInTheDocument()
    expect(screen.getByText('SAR 25,000 per month')).toBeInTheDocument()
    expect(screen.getByText('Information Technology')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('SAP BW')).toBeInTheDocument()
    expect(screen.getByText('Leadership')).toBeInTheDocument()
    expect(screen.getByText('Data')).toBeInTheDocument()
    expect(screen.getByText('Workplace not specified')).toBeInTheDocument()
    expect(screen.queryByText('Hybrid')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /company profile/i })).toHaveAttribute('href', 'https://example.com/company')
    expect(screen.getByText(/greenhouse is supported by the optional browser extension/i)).toBeInTheDocument()
    expect(screen.getByText('No description or requirements were captured from the job listing.')).toBeInTheDocument()
  })
})
