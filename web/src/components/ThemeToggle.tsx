import { useTheme } from '../hooks/useTheme'
import { Sun, Moon, Star } from 'lucide-react'

const themeIcons = {
  light: Sun,
  dark: Moon,
  midnight: Star,
}

const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  midnight: 'Midnight',
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const Icon = themeIcons[theme]

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-outline-secondary d-flex align-items-center gap-2"
      aria-label={`Current theme: ${themeLabels[theme]}. Click to switch.`}
      title={`Theme: ${themeLabels[theme]} (click to switch)`}
    >
      <Icon className="w-4 h-4" />
      <span className="d-none d-sm-inline small">{themeLabels[theme]}</span>
    </button>
  )
}
