import { memo, useState, useRef, useEffect, useMemo } from 'react'
import { X, ChevronDown, Check, Search } from 'lucide-react'

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

const CountryMultiSelectInner = ({
  label,
  placeholder = 'Select countries',
  selected,
  options,
  onChange,
  disabled = false,
}: CountryMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase()
    return options.filter((country) => country.toLowerCase().includes(query))
  }, [options, searchQuery])

  const toggleCountry = (country: string) => {
    if (selected.includes(country)) {
      onChange(selected.filter((c) => c !== country))
    } else {
      onChange([...selected, country])
    }
  }

  const removeCountry = (country: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((c) => c !== country))
  }

  const displayText = selected.length === 0
    ? placeholder
    : `${selected.length} countr${selected.length > 1 ? 'ies' : 'y'} selected`

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        {label}
      </label>

      <button
        type="button"
        className="input-modern flex justify-between items-center text-left"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selected.length === 0 ? 'text-slate-400 dark:text-slate-500' : ''}>
          {displayText}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((country) => (
            <span
              key={country}
              className="badge badge-primary flex items-center gap-1.5"
            >
              <span>{countryFlags[country] || '🌍'}</span>
              <span>{country}</span>
              <button
                type="button"
                className="hover:bg-violet-200 dark:hover:bg-violet-700 rounded-full p-0.5 transition-colors"
                onClick={(e) => removeCountry(country, e)}
                aria-label={`Remove ${country}`}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-72 overflow-hidden animate-fade-in"
          role="listbox"
        >
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex gap-2">
            <button
              type="button"
              className="btn-ghost text-xs flex-1 py-1.5"
              onClick={() => onChange([...options])}
              disabled={selected.length === options.length}
            >
              Select All
            </button>
            <button
              type="button"
              className="btn-ghost text-xs flex-1 py-1.5"
              onClick={() => onChange([])}
              disabled={selected.length === 0}
            >
              Clear
            </button>
          </div>

          <div className="overflow-y-auto max-h-44 p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                No countries found
              </div>
            ) : (
              filteredOptions.map((country) => {
                const isSelected = selected.includes(country)
                return (
                  <button
                    key={country}
                    type="button"
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() => toggleCountry(country)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="text-lg">{countryFlags[country] || '🌍'}</span>
                    <span className="flex-1 font-medium">{country}</span>
                    {isSelected && <Check className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const CountryMultiSelect = memo(CountryMultiSelectInner)
