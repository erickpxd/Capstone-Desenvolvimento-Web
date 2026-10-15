import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '../../app/theme'
import { useAuth } from '../../features/auth/AuthContext'
import { PublicHeader } from './PublicHeader'

jest.mock('../../features/auth/AuthContext', () => ({ useAuth: jest.fn() }))
const mockedUseAuth = jest.mocked(useAuth)

test('apresenta conta autenticada e executa logout no desktop', async () => {
  const user = userEvent.setup()
  const signOut = jest.fn().mockResolvedValue(undefined)
  mockedUseAuth.mockReturnValue({ user: { email: 'aluno@example.com' } as never, session: {} as never, isLoading: false, signOut, signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(<ThemeProvider><MemoryRouter initialEntries={['/catalogo']}><Routes><Route path="*" element={<><PublicHeader /><p>Página</p></>} /></Routes></MemoryRouter></ThemeProvider>)
  expect(screen.getAllByRole('link', { name: /minha conta/i })[0]).toHaveAttribute('href', '/minha-conta')
  await user.click(screen.getAllByRole('button', { name: /^sair$/i })[0])
  expect(signOut).toHaveBeenCalled()
})

test('fecha o menu móvel ao navegar e permite logout móvel', async () => {
  const user = userEvent.setup()
  const signOut = jest.fn().mockResolvedValue(undefined)
  mockedUseAuth.mockReturnValue({ user: { email: 'aluno@example.com' } as never, session: {} as never, isLoading: false, signOut, signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(<ThemeProvider><MemoryRouter><PublicHeader /></MemoryRouter></ThemeProvider>)
  await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
  await user.click(screen.getAllByRole('button', { name: /^sair$/i })[1])
  expect(signOut).toHaveBeenCalled()
  expect(screen.queryByRole('navigation', { name: 'Menu móvel' })).not.toBeInTheDocument()
})
