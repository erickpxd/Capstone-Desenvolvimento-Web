import { requireSupabase } from '../../lib/supabase'

export interface LoginCredentials {
  email: string
  password: string
}

export async function signInWithPassword(credentials: LoginCredentials): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithPassword(credentials)
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

