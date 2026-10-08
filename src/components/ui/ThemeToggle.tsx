import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../app/theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  const label = dark ? 'Ativar modo claro' : 'Ativar modo noturno'

  return (
    <button type="button" onClick={toggleTheme} aria-label={label} title={label} className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors hover:bg-primary-soft hover:text-primary">
      {dark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
    </button>
  )
}
