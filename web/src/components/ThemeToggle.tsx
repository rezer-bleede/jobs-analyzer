import { Sun, Moon, Check } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useState, useRef, useEffect } from 'react'

const themes = [
  { value: 'light', label: 'Light', description: 'Clean and bright', icon: Sun },
  { value: 'dark', label: 'Dark', description: 'Easy on the eyes', icon: Moon },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
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

  const currentTheme = themes.find((t) => t.value === theme) ?? themes[0]
  const Icon = currentTheme.icon

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm font-medium"
        aria-label={`Current theme: ${currentTheme.label}. Click to change.`}
      >
        <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        <span className="hidden sm:inline text-slate-700 dark:text-slate-200">{currentTheme.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-fade-in">
          {themes.map((themeOption) => {
            const ThemeIcon = themeOption.icon
            const isActive = theme === themeOption.value
            return (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <ThemeIcon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{themeOption.label}</div>
                  <div className="text-xs opacity-60">{themeOption.description}</div>
                </div>
                {isActive && <Check className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
