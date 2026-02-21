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
    <section className="section-card mb-6">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <SearchMultiSelect
              label="Search roles or companies"
              placeholder="Search by title, company, technology, or keywords"
              selected={filters.searchTerms}
              options={searchOptions}
              onChange={(next) => onChange({ searchTerms: next })}
              disabled={isLoading}
            />
          </div>
          <div className="lg:col-span-3">
            <label htmlFor="location-filter" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Location
            </label>
            <select
              id="location-filter"
              className="input-modern"
              value={filters.location}
              onChange={(e) => onChange({ location: e.target.value })}
              disabled={isLoading}
            >
              {locationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="date-posted" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Date posted
            </label>
            <select
              id="date-posted"
              className="input-modern"
              value={filters.datePosted}
              onChange={(e) => onChange({ datePosted: e.target.value })}
              disabled={isLoading}
            >
              {datePostedOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2 flex items-end">
            <button
              type="button"
              className="btn-secondary w-full flex items-center justify-center gap-2"
              onClick={onReset}
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {countryOptions.length > 0 && (
          <div className="max-w-md">
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
