import { useId, useMemo, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'

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
    if (!trimmed) {
      return
    }

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
      <label htmlFor={inputId} className="form-label text-uppercase fw-semibold small text-secondary">
        {label}
      </label>
      <div className="search-multi-select position-relative">
        <div className="form-control form-control-lg d-flex flex-wrap gap-2 align-items-center py-2">
          {selected.map((term) => (
            <span
              key={term}
              className="badge bg-primary-subtle text-primary-emphasis rounded-pill d-flex align-items-center gap-2"
            >
              <span>{term}</span>
              <button
                type="button"
                className="btn-close btn-close-sm"
                aria-label={`Remove ${term}`}
                onClick={() => removeTerm(term)}
                disabled={disabled}
              />
            </span>
          ))}
          <input
            id={inputId}
            className="search-multi-select__input flex-grow-1 border-0 bg-transparent"
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
