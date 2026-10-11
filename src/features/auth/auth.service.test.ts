import { authenticatedFetch, signInWithPassword, signOut } from './auth.service'
import { requireSupabase } from '../../lib/supabase'

jest.mock('../../lib/supabase', () => ({ requireSupabase: jest.fn() }))
const mockedRequireSupabase = jest.mocked(requireSupabase)
const mockedFetch = jest.fn()
global.fetch = mockedFetch

function authClient(overrides: Record<string, unknown> = {}) {
  return { auth: {
    signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
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
