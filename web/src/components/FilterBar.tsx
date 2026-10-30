import { RotateCcw } from 'lucide-react'
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
    <section className="section-card filter-bar-sticky mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2">
        <div className="sm:col-span-2 lg:col-span-4">
          <SearchMultiSelect
            label="Search roles or companies"
            placeholder="Search by title, company, technology, or keywords"
            compactLabel
            selected={filters.searchTerms}
            options={searchOptions}
            onChange={(next) => onChange({ searchTerms: next })}
            disabled={isLoading}
          />
        </div>
        <div className="lg:col-span-2">
          <label htmlFor="location-filter" className="sr-only">Location</label>
          <select
            id="location-filter"
            className="input-modern min-h-[44px]"
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            disabled={isLoading}
          >
            {locationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label htmlFor="date-posted" className="sr-only">Date posted</label>
          <select
            id="date-posted"
            className="input-modern min-h-[44px]"
            value={filters.datePosted}
            onChange={(e) => onChange({ datePosted: e.target.value })}
            disabled={isLoading}
          >
            {datePostedOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <div className="lg:col-span-3">
          {countryOptions.length > 0 && (
            <CountryMultiSelect
              label="Countries"
              placeholder="All countries"
              selected={filters.countries}
              options={countryOptions}
              onChange={(countries) => onChange({ countries })}
              disabled={isLoading}
              compactLabel
            />
          )}
        </div>
        <div className="lg:col-span-1">
          <button
            type="button"
            className="btn-secondary min-h-[44px] w-full"
            onClick={onReset}
            disabled={isLoading}
            aria-label="Reset filters"
            title="Reset filters"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
