import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ children, role }: PropsWithChildren<{ role?: 'admin' }>) {
  const { user, isLoading, role: userRole } = useAuth()
  const location = useLocation()

  if (isLoading) return <main className="container-page py-24 text-center" role="status">Validando sua sessão…</main>
  if (!user) return <Navigate to="/entrar" replace state={{ returnTo: `${location.pathname}${location.search}` }} />
  if (role === 'admin' && userRole !== 'admin') return <Navigate to="/minha-conta" replace />
  return children
}
