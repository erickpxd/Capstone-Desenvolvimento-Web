import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { ThemeProvider, useTheme } from './theme'

function wrapper({ children }: PropsWithChildren) { return <ThemeProvider>{children}</ThemeProvider> }

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.className = ''
})

test('o hook alterna o tema e persiste a preferência', () => {
  const { result } = renderHook(() => useTheme(), { wrapper })
  expect(result.current.theme).toBe('light')

  act(() => result.current.toggleTheme())

  expect(result.current.theme).toBe('dark')
  expect(document.documentElement).toHaveClass('dark')
  expect(window.localStorage.getItem('biblioteca-online-theme')).toBe('dark')
})

test('o hook exige seu provider', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  expect(() => renderHook(() => useTheme())).toThrow('useTheme precisa ser usado dentro de ThemeProvider')
  consoleError.mockRestore()
})
