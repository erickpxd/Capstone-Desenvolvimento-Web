import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { signOut } from './auth.service'
import { AuthProvider, useAuth } from './AuthContext'
import { supabase } from '../../lib/supabase'

jest.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { auth: { getSession: jest.fn(), onAuthStateChange: jest.fn() } },
}))
jest.mock('./auth.service', () => ({ signOut: jest.fn() }))

const auth = supabase!.auth
const mockedGetSession = jest.mocked(auth.getSession)
const mockedOnAuthStateChange = jest.mocked(auth.onAuthStateChange)

function wrapper({ children }: PropsWithChildren) { return <AuthProvider>{children}</AuthProvider> }

test('restaura a sessão, reage a mudanças e remove o listener', async () => {
  const unsubscribe = jest.fn()
  let notify: (_event: string, session: unknown) => void = () => undefined
  const session = { access_token: 'token', user: { id: '1', email: 'aluno@example.com' } }
  mockedGetSession.mockResolvedValue({ data: { session }, error: null } as never)
  mockedOnAuthStateChange.mockImplementation((callback) => {
    notify = callback as typeof notify
    return { data: { subscription: { unsubscribe } } } as never
  })

  const { result, unmount } = renderHook(() => useAuth(), { wrapper })
  await waitFor(() => expect(result.current.user?.email).toBe('aluno@example.com'))
  expect(result.current.isLoading).toBe(false)

  act(() => notify('SIGNED_OUT', null))
  expect(result.current.user).toBeNull()
  await result.current.signOut()
  expect(signOut).toHaveBeenCalled()

  unmount()
  expect(unsubscribe).toHaveBeenCalled()
})

test('o hook exige AuthProvider', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  expect(() => renderHook(() => useAuth())).toThrow('useAuth precisa ser usado dentro de AuthProvider')
  consoleError.mockRestore()
})
