import { useTheme } from '../hooks/useTheme'
import { Sun, Moon, Zap } from 'lucide-react'
import { useState } from 'react'

const themeIcons = {
  light: Sun,
  dark: Moon,
  neon: Zap,
}

const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  neon: 'Neon',
}

const themeDescriptions = {
  light: 'Clean and bright',
  dark: 'Easy on the eyes',
  neon: 'Vibrant and bold',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
        aria-label={`Current theme: ${themeLabels[theme]}. Click to change.`}
      >
        {(() => {
          const Icon = themeIcons[theme]
          return <Icon className="w-4 h-4" />
        })()}
        <span className="hidden sm:inline">{themeLabels[theme]}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {(Object.keys(themeLabels) as Array<keyof typeof themeLabels>).map((themeKey) => {
              const Icon = themeIcons[themeKey]
              const isActive = theme === themeKey
              return (
                <button
                  key={themeKey}
                  onClick={() => {
                    setTheme(themeKey)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{themeLabels[themeKey]}</div>
                    <div className="text-xs opacity-70">{themeDescriptions[themeKey]}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
