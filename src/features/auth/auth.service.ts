import type { Session } from '@supabase/supabase-js'
import { requireSupabase } from '../../lib/supabase'

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends LoginCredentials {
  fullName: string
}

export async function signInWithPassword(credentials: LoginCredentials): Promise<Session> {
  const { data, error } = await requireSupabase().auth.signInWithPassword(credentials)
  if (error) throw error
  if (!data.session) throw new Error('O Supabase não retornou uma sessão válida.')
  return data.session
}

export async function signUp({ fullName, email, password }: SignUpCredentials): Promise<{ requiresEmailConfirmation: boolean }> {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw error
  return { requiresEmailConfirmation: !data.session }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const redirectTo = `${window.location.origin}/recuperar-senha/nova`
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await requireSupabase().auth.updateUser({ password })
  if (error) throw error
}

export async function updateProfile(fullName: string): Promise<void> {
  const { error } = await requireSupabase().auth.updateUser({ data: { full_name: fullName } })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw error
}

export async function getAccessToken(): Promise<string | null> {
  const { data, error } = await requireSupabase().auth.getSession()
  if (error) throw error
  return data.session?.access_token ?? null
}

/** Sends the active session token to protected REST endpoints. */
export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken()
  if (!token) throw new Error('Sessão expirada. Entre novamente para continuar.')

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Accept', 'application/json')
  return fetch(input, { ...init, headers })
}

