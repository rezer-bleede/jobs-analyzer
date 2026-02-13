import type { ChangeEvent } from 'react'
import type { JobFilters } from '../types/job'
import { SearchMultiSelect } from './SearchMultiSelect'
import { CountryMultiSelect } from './CountryMultiSelect'

interface FilterBarProps {
  filters: JobFilters
  locationOptions: string[]
  countryOptions: string[]
  searchOptions: string[]
  datePostedOptions: readonly string[]
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
  countryOptions,
  searchOptions,
  datePostedOptions,
  isLoading,
  onChange,
  onReset,
}: FilterBarProps) => {
  return (
    <section className="filter-bar bg-white rounded-4 shadow-sm p-4 mb-4">
      <div className="d-flex flex-column gap-3">
        <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-end">
          <div className="flex-grow-1 w-100">
            <SearchMultiSelect
              label="Search roles or companies"
              placeholder="Search by title, company, technology, or keywords"
              selected={filters.searchTerms}
              options={searchOptions}
              onChange={(next) => onChange({ searchTerms: next })}
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
            <label htmlFor="datePosted" className="form-label text-uppercase fw-semibold small text-secondary">
              Date posted
            </label>
            <select
              id="datePosted"
              name="datePosted"
              className="form-select form-select-lg"
              value={filters.datePosted}
              onChange={(event) => handleTextChange(event, onChange)}
              disabled={isLoading}
            >
              {datePostedOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
        
        {countryOptions.length > 0 && (
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <CountryMultiSelect
              label="Countries"
              placeholder="Filter by countries"
              selected={filters.countries}
              options={countryOptions}
              onChange={(countries) => onChange({ countries })}
              disabled={isLoading}
            />
          </div>
        )}
      </div>
    </section>
  )
}
