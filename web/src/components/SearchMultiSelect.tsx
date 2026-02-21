import { useId, useMemo, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface SearchMultiSelectProps {
  label: string
  placeholder: string
  selected: string[]
  options: string[]
  disabled?: boolean
  onChange: (next: string[]) => void
}

const normalise = (value: string) => value.trim().toLowerCase()

export const SearchMultiSelect = ({
  label,
  placeholder,
  selected,
  options,
  disabled = false,
  onChange,
}: SearchMultiSelectProps) => {
  const inputId = useId()
  const listId = `${inputId}-datalist`
  const [inputValue, setInputValue] = useState('')

  const normalisedSelected = useMemo(() => selected.map(normalise), [selected])

  const addTerm = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    const normalisedValue = normalise(trimmed)
    if (normalisedSelected.includes(normalisedValue)) {
      setInputValue('')
      return
    }

    const matchingOption = options.find((option) => normalise(option) === normalisedValue)
    const nextValue = matchingOption ?? trimmed
    onChange([...selected, nextValue])
    setInputValue('')
  }

  const removeTerm = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setInputValue(value)

    if (options.some((option) => option === value)) {
      addTerm(value)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === 'Tab' || event.key === ',') {
      if (inputValue.trim().length > 0) {
        event.preventDefault()
        addTerm(inputValue)
      }
    }

    if (event.key === 'Backspace' && inputValue.length === 0 && selected.length > 0) {
      event.preventDefault()
      removeTerm(selected[selected.length - 1])
    }
  }

  const handleBlur = () => {
    if (inputValue.trim().length > 0) {
      addTerm(inputValue)
    }
  }

  const suggestions = useMemo(
    () =>
      options
        .filter((option) => option.toLowerCase().includes(inputValue.trim().toLowerCase()))
        .filter((option) => !normalisedSelected.includes(normalise(option)))
        .slice(0, 10),
    [inputValue, normalisedSelected, options],
  )

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="flex flex-wrap gap-2 items-center px-3 py-2 min-h-[46px] w-full border border-[hsl(var(--border))] rounded-[var(--radius-lg)] bg-[hsl(var(--background))] transition-all duration-200 focus-within:border-[hsl(var(--primary))] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]">
          {selected.map((term) => (
            <span
              key={term}
              className="badge badge-primary flex items-center gap-1.5"
            >
              <span>{term}</span>
              <button
                type="button"
                className="hover:bg-violet-200 dark:hover:bg-violet-700 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${term}`}
                onClick={() => removeTerm(term)}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            id={inputId}
            className="search-multi-select__input flex-1 min-w-0 border-0 bg-transparent outline-none"
            type="search"
            list={listId}
            placeholder={selected.length === 0 ? placeholder : ''}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={disabled}
            autoComplete="off"
          />
        </div>
        <datalist id={listId}>
          {suggestions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
    </div>
  )
}
