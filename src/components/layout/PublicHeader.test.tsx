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
  expect(screen.getByRole('navigation', { name: 'Área do aluno' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Meus empréstimos' })).toHaveAttribute('href', '/minha-conta/emprestimos')
  await user.click(screen.getByRole('button', { name: 'Abrir menu da conta' }))
  expect(screen.getByRole('menuitem', { name: /meu painel/i })).toHaveAttribute('href', '/minha-conta')
  expect(screen.getByRole('menuitem', { name: /meu perfil/i })).toHaveAttribute('href', '/minha-conta/perfil')
  await user.click(screen.getByRole('menuitem', { name: /sair da conta/i }))
  expect(signOut).toHaveBeenCalled()
})

test('fecha o menu móvel ao navegar e permite logout móvel', async () => {
  const user = userEvent.setup()
  const signOut = jest.fn().mockResolvedValue(undefined)
  mockedUseAuth.mockReturnValue({ user: { email: 'aluno@example.com' } as never, session: {} as never, isLoading: false, signOut, signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(<ThemeProvider><MemoryRouter><PublicHeader /></MemoryRouter></ThemeProvider>)
  await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
  await user.click(screen.getByRole('button', { name: /^sair$/i }))
  expect(signOut).toHaveBeenCalled()
  expect(screen.queryByRole('navigation', { name: 'Menu móvel' })).not.toBeInTheDocument()
})

test('exibe a administração e fecha o menu da conta por teclado e clique externo', async () => {
  const user = userEvent.setup()
  mockedUseAuth.mockReturnValue({ user: { email: 'admin@example.com' } as never, session: {} as never, isLoading: false, signOut: jest.fn(), signIn: jest.fn(), role: 'admin', displayName: 'Erick Pessoa' })
  render(<ThemeProvider><MemoryRouter><PublicHeader /></MemoryRouter></ThemeProvider>)

  const trigger = screen.getByRole('button', { name: 'Abrir menu da conta' })
  expect(trigger).toHaveTextContent('EP')
  await user.click(trigger)
  expect(screen.getByRole('menuitem', { name: /administração/i })).toHaveAttribute('href', '/admin')

  await user.keyboard('{Escape}')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()

  await user.click(trigger)
  await user.click(document.body)
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})
