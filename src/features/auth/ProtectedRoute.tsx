import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <main className="container-page py-24 text-center" role="status">Validando sua sessão…</main>
  if (!user) return <Navigate to="/entrar" replace state={{ returnTo: `${location.pathname}${location.search}` }} />
  return children
}
