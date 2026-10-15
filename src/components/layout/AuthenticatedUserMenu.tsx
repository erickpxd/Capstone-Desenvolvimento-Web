import { ChevronDown, LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'

export function AuthenticatedUserMenu({ compact = false }: { compact?: boolean }) {
  const { displayName, role, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const initials = displayName.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'U'

  useEffect(() => {
    function close(event: MouseEvent) { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    function closeWithEscape(event: KeyboardEvent) { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', closeWithEscape)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', closeWithEscape) }
  }, [])

  async function logout() {
    setOpen(false)
    await signOut()
    navigate('/', { replace: true })
  }

  return <div className="relative" ref={root}>
    <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={open ? 'Fechar menu da conta' : 'Abrir menu da conta'} onClick={() => setOpen((value) => !value)} className="flex items-center gap-3 rounded-lg p-1 text-ink hover:bg-primary-soft">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary" aria-hidden="true">{initials}</span>
      {!compact && <span className="hidden max-w-36 truncate text-sm md:block">{displayName}</span>}
      {!compact && <ChevronDown className={`hidden transition-transform md:block ${open ? 'rotate-180' : ''}`} size={16} aria-hidden="true" />}
    </button>
    {open && <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-xl border border-line bg-surface p-2 shadow-card">
      <div className="border-b border-line px-3 py-2"><p className="truncate text-sm font-semibold">{displayName}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-subtle">{role === 'admin' ? 'Administrador' : 'Estudante'}</p></div>
      <Link role="menuitem" onClick={() => setOpen(false)} to="/minha-conta" className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-primary-soft hover:text-primary"><LayoutDashboard size={16} />Meu painel</Link>
      <Link role="menuitem" onClick={() => setOpen(false)} to="/minha-conta/perfil" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-primary-soft hover:text-primary"><UserRound size={16} />Meu perfil</Link>
      {role === 'admin' && <Link role="menuitem" onClick={() => setOpen(false)} to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-primary-soft hover:text-primary"><Settings size={16} />Administração</Link>}
      <button role="menuitem" onClick={logout} className="mt-1 flex w-full items-center gap-3 border-t border-line px-3 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"><LogOut size={16} />Sair da conta</button>
    </div>}
  </div>
}
