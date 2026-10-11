import { LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function AccountPage() {
  const { user, signOut } = useAuth()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()

  async function logout() {
    setPending(true)
    setError('')
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível sair.')
      setPending(false)
    }
  }

  return <main className="container-page py-16 md:py-24">
    <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-7 shadow-card md:p-10">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary"><UserRound /></span>
      <p className="eyebrow mt-6">Área protegida</p>
      <h1 className="mt-3 text-3xl">Minha conta</h1>
      <p className="mt-3 text-sm text-muted">Sua sessão institucional está ativa.</p>
      <div className="mt-7 rounded-xl bg-canvas p-5">
        <p className="text-xs text-subtle">E-mail</p>
        <p className="mt-1 font-medium">{user?.email}</p>
        <p className="mt-4 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"><ShieldCheck size={16} />Token armazenado e renovado com segurança pelo Supabase.</p>
      </div>
      {error && <p className="mt-5 text-sm text-red-700" role="alert">{error}</p>}
      <button className="btn-outline mt-7" type="button" onClick={logout} disabled={pending}><LogOut size={17} />{pending ? 'Saindo…' : 'Sair da conta'}</button>
    </div>
  </main>
}
