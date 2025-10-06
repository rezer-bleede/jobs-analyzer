import type { ChangeEvent } from 'react'
import type { JobFilters } from '../types/job'

interface FilterBarProps {
  filters: JobFilters
  locationOptions: string[]
  jobTypeOptions: string[]
  isLoading: boolean
  onChange: (updates: Partial<JobFilters>) => void
  onReset: () => void
}

const handleTextChange = (
  event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  onChange: (updates: Partial<JobFilters>) => void,
) => {
  const { name, value } = event.target
  onChange({ [name]: value } as Partial<JobFilters>)
}

export const FilterBar = ({
  filters,
  locationOptions,
  jobTypeOptions,
  isLoading,
  onChange,
  onReset,
}: FilterBarProps) => {
  const onRemoteToggle = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ remoteOnly: event.target.checked })
  }

  return (
    <section className="filter-bar bg-white rounded-4 shadow-sm p-4 mb-4">
      <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-end">
        <div className="flex-grow-1 w-100">
          <label htmlFor="searchTerm" className="form-label text-uppercase fw-semibold small text-secondary">
            Search roles or companies
          </label>
          <input
            id="searchTerm"
            name="searchTerm"
            type="search"
            className="form-control form-control-lg"
            placeholder="Search by title, company, technology, or keywords"
            value={filters.searchTerm}
            onChange={(event) => handleTextChange(event, onChange)}
            disabled={isLoading}
          />
        </div>
        <div className="flex-grow-1 w-100">
          <label htmlFor="location" className="form-label text-uppercase fw-semibold small text-secondary">
            Location
          </label>
          <select
            id="location"
            name="location"
            className="form-select form-select-lg"
            value={filters.location}
            onChange={(event) => handleTextChange(event, onChange)}
            disabled={isLoading}
          >
            {locationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow-1 w-100">
          <label htmlFor="jobType" className="form-label text-uppercase fw-semibold small text-secondary">
            Job type
          </label>
          <select
            id="jobType"
            name="jobType"
            className="form-select form-select-lg"
            value={filters.jobType}
            onChange={(event) => handleTextChange(event, onChange)}
            disabled={isLoading}
          >
            {jobTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow-1 w-100">
          <label className="form-label text-uppercase fw-semibold small text-secondary">
            Remote friendly
          </label>
          <div className="form-check form-switch ps-0 d-flex align-items-center gap-2">
            <input
              id="remoteOnly"
              name="remoteOnly"
              className="form-check-input ms-0"
              type="checkbox"
              role="switch"
              checked={filters.remoteOnly}
              onChange={onRemoteToggle}
              disabled={isLoading}
            />
            <label htmlFor="remoteOnly" className="form-check-label fw-semibold">
              Remote only
            </label>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            type="button"
            className="btn btn-outline-secondary btn-lg text-nowrap"
            onClick={onReset}
            disabled={isLoading}
          >
            Reset filters
          </button>
        </div>
      </div>
    </section>
  )
}
