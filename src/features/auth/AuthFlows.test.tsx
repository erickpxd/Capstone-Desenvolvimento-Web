import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { requestPasswordReset, signUp, updatePassword } from './auth.service'
import { NewPasswordPage, PasswordRecoveryPage } from './PasswordRecoveryPage'
import { SignUpPage } from './SignUpPage'

jest.mock('../../lib/supabase', () => ({ isSupabaseConfigured: true }))
jest.mock('./auth.service', () => ({ signUp: jest.fn(), requestPasswordReset: jest.fn(), updatePassword: jest.fn() }))
const mockedSignUp = jest.mocked(signUp)
const mockedReset = jest.mocked(requestPasswordReset)
const mockedPassword = jest.mocked(updatePassword)

function renderWithProviders(element: React.ReactNode, entry = '/') {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[entry]}><Routes><Route path="*" element={element} /><Route path="/minha-conta" element={<h1>Painel</h1>} /><Route path="/entrar" element={<h1>Entrar novamente</h1>} /></Routes></MemoryRouter></QueryClientProvider>)
}

beforeEach(() => jest.clearAllMocks())

test('cria uma conta válida e abre o painel quando há sessão', async () => {
  mockedSignUp.mockResolvedValue({ requiresEmailConfirmation: false })
  const user = userEvent.setup()
  renderWithProviders(<SignUpPage />, '/cadastro')
  await user.type(screen.getByLabelText(/nome completo/i), 'Ana Martins')
  await user.type(screen.getByLabelText(/e-mail institucional/i), 'ana@example.com')
  await user.type(screen.getByPlaceholderText(/crie uma senha/i), 'senha123')
  await user.type(screen.getByLabelText(/confirmação de senha/i), 'senha123')
  await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: /criar conta institucional/i }))
  expect(await screen.findByRole('heading', { name: 'Painel' })).toBeInTheDocument()
  expect(mockedSignUp).toHaveBeenCalledWith({ fullName: 'Ana Martins', email: 'ana@example.com', password: 'senha123' })
})

test('valida cadastro antes de enviar', async () => {
  const user = userEvent.setup()
  renderWithProviders(<SignUpPage />, '/cadastro')
  await user.type(screen.getByLabelText(/nome completo/i), 'Ana')
  await user.type(screen.getByLabelText(/e-mail institucional/i), 'ana@example.com')
  await user.type(screen.getByPlaceholderText(/crie uma senha/i), 'curta')
  await user.type(screen.getByLabelText(/confirmação de senha/i), 'outra')
  await user.click(screen.getByRole('button', { name: /criar conta institucional/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent('8 caracteres')
  expect(mockedSignUp).not.toHaveBeenCalled()
})

test('valida confirmação e aceite do cadastro', async () => {
  const user = userEvent.setup()
  const first = renderWithProviders(<SignUpPage />, '/cadastro')
  await user.type(screen.getByPlaceholderText(/crie uma senha/i), 'senha123')
  await user.type(screen.getByPlaceholderText(/repita a senha/i), 'senha456')
  await user.click(screen.getByRole('button', { name: /criar conta institucional/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent('não coincidem')
  first.unmount()

  renderWithProviders(<SignUpPage />, '/cadastro')
  await user.type(screen.getByPlaceholderText(/crie uma senha/i), 'senha123')
  await user.type(screen.getByPlaceholderText(/repita a senha/i), 'senha123')
  await user.click(screen.getByRole('button', { name: /criar conta institucional/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Aceite os termos')
})

test('encaminha cadastro sem sessão para confirmação por e-mail', async () => {
  mockedSignUp.mockResolvedValue({ requiresEmailConfirmation: true })
  const user = userEvent.setup()
  renderWithProviders(<SignUpPage />, '/cadastro')
  await user.type(screen.getByLabelText(/nome completo/i), 'Ana Martins')
  await user.type(screen.getByLabelText(/e-mail institucional/i), 'ana@example.com')
  await user.type(screen.getByPlaceholderText(/crie uma senha/i), 'senha123')
  await user.type(screen.getByPlaceholderText(/repita a senha/i), 'senha123')
  await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: /criar conta institucional/i }))
  expect(await screen.findByRole('heading', { name: 'Entrar novamente' })).toBeInTheDocument()
})

test('solicita e permite reenviar o link de recuperação', async () => {
  mockedReset.mockResolvedValue()
  const user = userEvent.setup()
  renderWithProviders(<PasswordRecoveryPage />, '/recuperar-senha')
  await user.type(screen.getByLabelText(/e-mail institucional/i), 'ana@example.com')
  await user.click(screen.getByRole('button', { name: /enviar link/i }))
  expect(await screen.findByRole('heading', { name: /confira seu e-mail/i })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /reenviar e-mail/i }))
  expect(mockedReset).toHaveBeenCalledTimes(2)
})

test('mostra falha ao solicitar recuperação', async () => {
  mockedReset.mockRejectedValue(new Error('indisponível'))
  const user = userEvent.setup()
  renderWithProviders(<PasswordRecoveryPage />, '/recuperar-senha')
  await user.type(screen.getByLabelText(/e-mail institucional/i), 'ana@example.com')
  await user.click(screen.getByRole('button', { name: /enviar link/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível')
})

test('salva uma nova senha recebida pelo link', async () => {
  mockedPassword.mockResolvedValue()
  const user = userEvent.setup()
  renderWithProviders(<NewPasswordPage />, '/recuperar-senha/nova#access_token=teste')
  await user.type(screen.getByLabelText(/^nova senha$/i), 'novaSenha123')
  await user.type(screen.getByLabelText(/confirmação de nova senha/i), 'novaSenha123')
  await user.click(screen.getByRole('button', { name: /salvar nova senha/i }))
  expect(await screen.findByRole('heading', { name: /seu acesso está pronto/i })).toBeInTheDocument()
  expect(mockedPassword).toHaveBeenCalledWith('novaSenha123')
})

test('valida a nova senha e avisa quando o link não contém sessão', async () => {
  const user = userEvent.setup()
  renderWithProviders(<NewPasswordPage />, '/recuperar-senha/nova')
  expect(screen.getByText(/abra esta página pelo link/i)).toBeInTheDocument()
  await user.type(screen.getByLabelText(/^nova senha$/i), 'curta')
  await user.type(screen.getByLabelText(/confirmação de nova senha/i), 'outra')
  await user.click(screen.getByRole('button', { name: /salvar nova senha/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent('8 caracteres')
})
