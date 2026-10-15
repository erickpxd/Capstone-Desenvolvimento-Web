import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '../../app/theme'
import { useAuth } from '../auth/AuthContext'
import { AdminLayout } from '../admin/AdminLayout'
import { AccountLayout } from './AccountLayout'

jest.mock('../auth/AuthContext', () => ({ useAuth: jest.fn() }))
const mockedUseAuth = jest.mocked(useAuth)

beforeEach(() => mockedUseAuth.mockReturnValue({ user: {} as never, session: {} as never, isLoading: false, signOut: jest.fn().mockResolvedValue(undefined), signIn: jest.fn(), role: 'student', displayName: 'Ana Martins' }))

test('navega pela área do aluno e abre o menu responsivo', async () => {
  const user = userEvent.setup()
  render(<ThemeProvider><MemoryRouter initialEntries={['/minha-conta']}><Routes><Route path="/minha-conta" element={<AccountLayout />}><Route index element={<h1>Conteúdo do painel</h1>} /></Route></Routes></MemoryRouter></ThemeProvider>)
  expect(screen.getByRole('heading', { name: 'Conteúdo do painel' })).toBeInTheDocument()
  expect(screen.getByText('Ana Martins')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
  expect(screen.getByRole('button', { name: 'Fechar menu' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Fechar menu' }))
})

test('abre a navegação administrativa e encerra a sessão', async () => {
  const user = userEvent.setup()
  const signOut = jest.fn().mockResolvedValue(undefined)
  mockedUseAuth.mockReturnValue({ user: {} as never, session: {} as never, isLoading: false, signOut, signIn: jest.fn(), role: 'admin', displayName: 'Admin' })
  render(<ThemeProvider><MemoryRouter initialEntries={['/admin']}><Routes><Route path="/admin" element={<AdminLayout />}><Route index element={<h1>Resumo administrativo</h1>} /></Route><Route path="/" element={<h1>Site público</h1>} /></Routes></MemoryRouter></ThemeProvider>)
  expect(screen.getByRole('heading', { name: 'Resumo administrativo' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
  expect(screen.getByRole('button', { name: 'Fechar navegação' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /sair da conta/i }))
  expect(signOut).toHaveBeenCalled()
  expect(await screen.findByRole('heading', { name: 'Site público' })).toBeInTheDocument()
})
