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

