import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { AccountPage } from './AccountPage'
import { ProtectedRoute } from './ProtectedRoute'
import { signInWithPassword, updatePassword, updateProfile } from './auth.service'

jest.mock('./AuthContext', () => ({ useAuth: jest.fn() }))
jest.mock('./auth.service', () => ({ signInWithPassword: jest.fn(), updatePassword: jest.fn(), updateProfile: jest.fn() }))
const mockedUseAuth = jest.mocked(useAuth)
const mockedSignIn = jest.mocked(signInWithPassword)
const mockedUpdatePassword = jest.mocked(updatePassword)
const mockedUpdateProfile = jest.mocked(updateProfile)
const withQuery = (children: React.ReactNode) => <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>{children}</QueryClientProvider>

beforeEach(() => jest.clearAllMocks())

test('redireciona visitante para login e preserva o destino', () => {
  mockedUseAuth.mockReturnValue({ user: null, session: null, isLoading: false, signOut: jest.fn(), signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(<MemoryRouter initialEntries={['/minha-conta']}><Routes>
    <Route path="/minha-conta" element={<ProtectedRoute><p>Privado</p></ProtectedRoute>} />
    <Route path="/entrar" element={<p>Login necessário</p>} />
  </Routes></MemoryRouter>)
  expect(screen.getByText('Login necessário')).toBeInTheDocument()
})

test('mostra validação enquanto a sessão carrega', () => {
  mockedUseAuth.mockReturnValue({ user: null, session: null, isLoading: true, signOut: jest.fn(), signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(<MemoryRouter><ProtectedRoute><p>Privado</p></ProtectedRoute></MemoryRouter>)
  expect(screen.getByRole('status')).toHaveTextContent('Validando sua sessão')
})

test('impede que estudante abra a administração', () => {
  mockedUseAuth.mockReturnValue({ user: {} as never, session: {} as never, isLoading: false, signOut: jest.fn(), signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(<MemoryRouter initialEntries={['/admin']}><Routes><Route path="/admin" element={<ProtectedRoute role="admin"><p>Administração</p></ProtectedRoute>} /><Route path="/minha-conta" element={<p>Painel do aluno</p>} /></Routes></MemoryRouter>)
  expect(screen.getByText('Painel do aluno')).toBeInTheDocument()
})

test('exibe a conta e conclui logout', async () => {
  const user = userEvent.setup()
  const logout = jest.fn().mockResolvedValue(undefined)
  mockedUseAuth.mockReturnValue({ user: { email: 'aluno@example.com' } as never, session: {} as never, isLoading: false, signOut: logout, signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(withQuery(<MemoryRouter initialEntries={['/minha-conta']}><Routes>
    <Route path="/minha-conta" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
    <Route path="/" element={<p>Página inicial</p>} />
  </Routes></MemoryRouter>))
  expect(screen.getByDisplayValue('aluno@example.com')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /sair da conta/i }))
  expect(logout).toHaveBeenCalled()
  expect(await screen.findByText('Página inicial')).toBeInTheDocument()
})

test('informa falha no logout', async () => {
  const user = userEvent.setup()
  mockedUseAuth.mockReturnValue({ user: { email: 'aluno@example.com' } as never, session: {} as never, isLoading: false, signOut: jest.fn().mockRejectedValue(new Error('Falha ao sair')), signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(withQuery(<MemoryRouter><AccountPage /></MemoryRouter>))
  await user.click(screen.getByRole('button', { name: /sair da conta/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao sair')
})

test('atualiza dados e senha do perfil autenticado', async () => {
  const user = userEvent.setup()
  mockedUpdateProfile.mockResolvedValue()
  mockedSignIn.mockResolvedValue({ access_token: 'token' } as never)
  mockedUpdatePassword.mockResolvedValue()
  mockedUseAuth.mockReturnValue({ user: { id: 'auth-user-1', email: 'aluno@example.com', created_at: '2026-01-01T12:00:00Z', last_sign_in_at: '2026-10-14T12:00:00Z', email_confirmed_at: '2026-01-01T12:05:00Z' } as never, session: {} as never, isLoading: false, signOut: jest.fn(), signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(withQuery(<MemoryRouter><AccountPage /></MemoryRouter>))

  const name = screen.getByLabelText(/nome completo/i)
  await user.clear(name)
  await user.type(name, 'Aluno Atualizado')
  await user.click(screen.getByRole('button', { name: /salvar alterações/i }))
  expect(await screen.findByText(/informações atualizadas/i)).toBeInTheDocument()
  expect(mockedUpdateProfile).toHaveBeenCalledWith('Aluno Atualizado')

  await user.type(screen.getByLabelText(/senha atual/i), 'senhaAnterior')
  await user.type(screen.getByLabelText(/nova senha/i), 'novaSenha123')
  await user.click(screen.getByRole('button', { name: /alterar senha/i }))
  expect(await screen.findByText(/senha alterada com sucesso/i)).toBeInTheDocument()
  expect(mockedSignIn).toHaveBeenCalledWith({ email: 'aluno@example.com', password: 'senhaAnterior' })
  expect(mockedUpdatePassword).toHaveBeenCalledWith('novaSenha123')
})

test('valida a nova senha antes de chamar o Supabase', async () => {
  const user = userEvent.setup()
  mockedUseAuth.mockReturnValue({ user: { email: 'aluno@example.com' } as never, session: {} as never, isLoading: false, signOut: jest.fn(), signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(withQuery(<MemoryRouter><AccountPage /></MemoryRouter>))
  await user.type(screen.getByLabelText(/senha atual/i), 'senhaAnterior')
  await user.type(screen.getByLabelText(/nova senha/i), 'curta')
  await user.click(screen.getByRole('button', { name: /alterar senha/i }))
  expect(await screen.findByRole('status')).toHaveTextContent('8 caracteres')
})

test('exige a senha atual antes de alterar a senha', async () => {
  const user = userEvent.setup()
  mockedUseAuth.mockReturnValue({ user: { email: 'aluno@example.com' } as never, session: {} as never, isLoading: false, signOut: jest.fn(), signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(withQuery(<MemoryRouter><AccountPage /></MemoryRouter>))
  await user.type(screen.getByLabelText(/nova senha/i), 'novaSenha123')
  await user.click(screen.getByRole('button', { name: /alterar senha/i }))
  expect(await screen.findByRole('status')).toHaveTextContent('senha atual')
  expect(mockedSignIn).not.toHaveBeenCalled()
})

test('recusa alteração de senha quando a sessão não possui e-mail', async () => {
  const user = userEvent.setup()
  mockedUseAuth.mockReturnValue({ user: {} as never, session: {} as never, isLoading: false, signOut: jest.fn(), signIn: jest.fn(), role: 'student', displayName: 'Aluno' })
  render(withQuery(<MemoryRouter><AccountPage /></MemoryRouter>))
  await user.type(screen.getByLabelText(/senha atual/i), 'senhaAnterior')
  await user.type(screen.getByLabelText(/nova senha/i), 'novaSenha123')
  await user.click(screen.getByRole('button', { name: /alterar senha/i }))
  expect(await screen.findByRole('status')).toHaveTextContent('e-mail válido')
})
