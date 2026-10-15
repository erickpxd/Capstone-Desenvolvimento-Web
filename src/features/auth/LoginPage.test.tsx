import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { LoginPage } from './LoginPage'

jest.mock('../../lib/supabase', () => ({ isSupabaseConfigured: true }))
jest.mock('./AuthContext', () => ({ useAuth: jest.fn() }))
const mockedUseAuth = jest.mocked(useAuth)
const signIn = jest.fn()

function renderLogin(state?: { returnTo?: string }) {
  mockedUseAuth.mockReturnValue({ user: null, session: null, isLoading: false, signIn, signOut: jest.fn(), role: 'student', displayName: 'Estudante' })
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[{ pathname: '/entrar', state }]}><Routes><Route path="/entrar" element={<LoginPage />} /><Route path="/minha-conta" element={<h1>Área autenticada</h1>} /></Routes></MemoryRouter></QueryClientProvider>)
}

beforeEach(() => signIn.mockReset())

test('atualiza a sessão e retorna à rota protegida depois do login', async () => {
  signIn.mockResolvedValue(undefined)
  const user = userEvent.setup()
  renderLogin({ returnTo: '/minha-conta' })
  await user.type(screen.getByLabelText(/e-mail institucional/i), 'aluno@universidade.edu.br')
  await user.type(screen.getByLabelText(/^senha$/i), 'senha-segura')
  await user.click(screen.getByRole('button', { name: /^entrar$/i }))
  await waitFor(() => expect(signIn).toHaveBeenCalledWith({ email: 'aluno@universidade.edu.br', password: 'senha-segura' }))
  expect(await screen.findByRole('heading', { name: 'Área autenticada' })).toBeInTheDocument()
})

test('mostra o erro devolvido pelo backend', async () => {
  signIn.mockRejectedValue(new Error('Credenciais inválidas'))
  const user = userEvent.setup()
  renderLogin()
  await user.type(screen.getByLabelText(/e-mail institucional/i), 'aluno@universidade.edu.br')
  await user.type(screen.getByLabelText(/^senha$/i), 'incorreta')
  await user.click(screen.getByRole('button', { name: /^entrar$/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas')
})

test('usa o painel como destino padrão após login', async () => {
  signIn.mockResolvedValue(undefined)
  const user = userEvent.setup()
  renderLogin()
  await user.type(screen.getByLabelText(/e-mail institucional/i), 'aluno@universidade.edu.br')
  await user.type(screen.getByLabelText(/^senha$/i), 'senha-segura')
  await user.click(screen.getByRole('button', { name: /^entrar$/i }))
  expect(await screen.findByRole('heading', { name: 'Área autenticada' })).toBeInTheDocument()
})
