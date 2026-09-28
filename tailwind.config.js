/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        primary: '#2563EB',
        canvas: '#F8FAFC',
        line: '#E2E8F0',
        muted: '#64748B',
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
