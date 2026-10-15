import type { Session, User } from '@supabase/supabase-js'
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { signInWithPassword, signOut as requestSignOut, type LoginCredentials } from './auth.service'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  signIn: (credentials: LoginCredentials) => Promise<void>
  role: 'student' | 'admin'
  displayName: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session)
    }).finally(() => { if (active) setIsLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    isLoading,
    signIn: async (credentials) => {
      const nextSession = await signInWithPassword(credentials)
      setSession(nextSession)
      setIsLoading(false)
    },
    signOut: async () => {
      await requestSignOut()
      setSession(null)
    },
    role: session?.user?.app_metadata?.role === 'admin' ? 'admin' : 'student',
    displayName: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Estudante',
  }), [isLoading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa ser usado dentro de AuthProvider')
  return context
}
