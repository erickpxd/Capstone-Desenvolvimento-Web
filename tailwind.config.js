/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        'primary-soft': 'rgb(var(--color-primary-soft) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        stage: 'rgb(var(--color-stage) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        subtle: 'rgb(var(--color-subtle) / <alpha-value>)',
        success: '#10B981',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 8px 24px rgba(15, 23, 42, 0.07)',
        book: '6px 10px 18px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
}
