import { useState, useRef, useEffect } from 'react'

interface CountryMultiSelectProps {
  label: string
  placeholder?: string
  selected: string[]
  options: string[]
  onChange: (countries: string[]) => void
  disabled?: boolean
}

const countryFlags: Record<string, string> = {
  'Saudi Arabia': '🇸🇦',
  'United Arab Emirates': '🇦🇪',
  'Qatar': '🇶🇦',
  'Kuwait': '🇰🇼',
  'Bahrain': '🇧🇭',
  'Oman': '🇴🇲',
}

export const CountryMultiSelect = ({
  label,
  placeholder = 'Select countries',
  selected,
  options,
  onChange,
  disabled = false,
}: CountryMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleCountry = (country: string) => {
    if (selected.includes(country)) {
      onChange(selected.filter((c) => c !== country))
    } else {
      onChange([...selected, country])
    }
  }

  const removeCountry = (country: string) => {
    onChange(selected.filter((c) => c !== country))
  }

  const displayText = selected.length === 0 
    ? placeholder 
    : `${selected.length} country${selected.length > 1 ? 'ies' : 'y'} selected`

  return (
    <div ref={containerRef} className="position-relative">
      <label className="form-label text-uppercase fw-semibold small text-secondary">
        {label}
      </label>
      
      <button
        type="button"
        className="form-select form-select-lg text-start d-flex justify-content-between align-items-center"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selected.length === 0 ? 'text-muted' : ''}>
          {displayText}
        </span>
        <span className="ms-2">▼</span>
      </button>

      {selected.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mt-2">
          {selected.map((country) => (
            <span
              key={country}
              className="badge bg-primary-subtle text-primary-emphasis rounded-pill d-flex align-items-center gap-1"
            >
              <span>{countryFlags[country] || '🌍'}</span>
              <span>{country}</span>
              <button
                type="button"
                className="btn-close btn-close-sm ms-1"
                style={{ fontSize: '0.5rem' }}
                onClick={() => removeCountry(country)}
                aria-label={`Remove ${country}`}
                disabled={disabled}
              />
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="position-absolute top-100 start-0 w-100 mt-1 bg-white border rounded shadow-lg"
          style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
          role="listbox"
        >
          <div className="p-2">
            <div className="d-flex gap-2 mb-2 pb-2 border-bottom">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => onChange([...options])}
                disabled={selected.length === options.length}
              >
                Select All
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => onChange([])}
                disabled={selected.length === 0}
              >
                Clear All
              </button>
            </div>
            
            {options.map((country) => (
              <div
                key={country}
                className="form-check py-1"
                role="option"
                aria-selected={selected.includes(country)}
              >
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`country-${country}`}
                  checked={selected.includes(country)}
                  onChange={() => toggleCountry(country)}
                />
                <label
                  className="form-check-label d-flex align-items-center gap-2"
                  htmlFor={`country-${country}`}
                >
                  <span className="fs-5">{countryFlags[country] || '🌍'}</span>
                  <span>{country}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
