import { authenticatedFetch, requestPasswordReset, signInWithPassword, signOut, signUp, updatePassword, updateProfile } from './auth.service'
import { requireSupabase } from '../../lib/supabase'

jest.mock('../../lib/supabase', () => ({ requireSupabase: jest.fn() }))
const mockedRequireSupabase = jest.mocked(requireSupabase)
const mockedFetch = jest.fn()
global.fetch = mockedFetch

function authClient(overrides: Record<string, unknown> = {}) {
  return { auth: {
    signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
    signUp: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    updateUser: jest.fn().mockResolvedValue({ error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'token-seguro' } }, error: null }),
    ...overrides,
  } }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedFetch.mockResolvedValue({ ok: true })
})

test('delega login e logout ao backend de autenticação', async () => {
  const client = authClient()
  mockedRequireSupabase.mockReturnValue(client as never)
  await signInWithPassword({ email: 'aluno@example.com', password: 'segredo' })
  await signOut()
  expect(client.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'aluno@example.com', password: 'segredo' })
  expect(client.auth.signOut).toHaveBeenCalledTimes(1)
})

test('executa cadastro, recuperação e atualizações da conta', async () => {
  const client = authClient()
  mockedRequireSupabase.mockReturnValue(client as never)

  await expect(signUp({ fullName: 'Ana Martins', email: 'ana@example.com', password: 'senha123' })).resolves.toEqual({ requiresEmailConfirmation: true })
  expect(client.auth.signUp).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'senha123', options: { data: { full_name: 'Ana Martins' } } })

  await requestPasswordReset('ana@example.com')
  expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith('ana@example.com', { redirectTo: expect.stringContaining('/recuperar-senha/nova') })

  await updatePassword('novaSenha123')
  await updateProfile('Ana Lima')
  expect(client.auth.updateUser).toHaveBeenNthCalledWith(1, { password: 'novaSenha123' })
  expect(client.auth.updateUser).toHaveBeenNthCalledWith(2, { data: { full_name: 'Ana Lima' } })
})

test('envia o access token no cabeçalho de uma API protegida', async () => {
  mockedRequireSupabase.mockReturnValue(authClient() as never)
  await authenticatedFetch('/api/emprestimos', { method: 'POST' })
  const init = mockedFetch.mock.calls[0][1] as RequestInit
  expect(new Headers(init.headers).get('Authorization')).toBe('Bearer token-seguro')
  expect(init.method).toBe('POST')
})

test('interrompe a chamada protegida quando não há sessão', async () => {
  mockedRequireSupabase.mockReturnValue(authClient({ getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }) }) as never)
  await expect(authenticatedFetch('/api/emprestimos')).rejects.toThrow('Sessão expirada')
  expect(mockedFetch).not.toHaveBeenCalled()
})

test('propaga erros de login, logout e leitura da sessão', async () => {
  const loginError = new Error('login inválido')
  mockedRequireSupabase.mockReturnValue(authClient({
    signInWithPassword: jest.fn().mockResolvedValue({ error: loginError }),
    signOut: jest.fn().mockResolvedValue({ error: new Error('logout falhou') }),
  }) as never)
  await expect(signInWithPassword({ email: 'x@example.com', password: 'x' })).rejects.toThrow('login inválido')
  await expect(signOut()).rejects.toThrow('logout falhou')

  mockedRequireSupabase.mockReturnValue(authClient({ getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: new Error('sessão falhou') }) }) as never)
  await expect(authenticatedFetch('/api/privado')).rejects.toThrow('sessão falhou')
})
