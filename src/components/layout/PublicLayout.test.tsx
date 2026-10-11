import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '../../app/theme'
import { HomePage } from '../../features/home/HomePage'
import { PublicLayout } from './PublicLayout'

const mockSignOut = jest.fn()
jest.mock('../../features/auth/AuthContext', () => ({
  useAuth: () => ({ user: null, signOut: mockSignOut }),
}))

test('renderiza home, navegação e rodapé e permite usar o menu móvel e o tema', async () => {
  const user = userEvent.setup()
  render(
    <ThemeProvider>
      <MemoryRouter>
        <Routes><Route element={<PublicLayout />}><Route path="/" element={<HomePage />} /></Route></Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )

  expect(screen.getByRole('heading', { level: 1, name: /seu próximo capítulo/i })).toBeInTheDocument()
  expect(screen.getByText('© 2026 Biblioteca Online')).toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: /catálogo/i }).length).toBeGreaterThan(0)

  await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
  expect(screen.getByRole('navigation', { name: 'Menu móvel' })).toBeInTheDocument()
  await user.click(screen.getAllByRole('button', { name: 'Ativar modo noturno' })[0])
  expect(document.documentElement).toHaveClass('dark')
})
