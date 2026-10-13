import { BarChart3, BookCopy, BookOpen, Bookmark, ChevronDown, Gauge, LogOut, Menu, Settings, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../../components/ui/Logo'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { useAuth } from '../auth/AuthContext'

const links = [
  ['/admin', 'Visão geral', Gauge], ['/admin/acervo', 'Gestão do acervo', BookOpen], ['/admin/exemplares', 'Exemplares', BookCopy], ['/admin/emprestimos', 'Empréstimos', BookOpen], ['/admin/reservas', 'Reservas', Bookmark], ['/admin/estudantes', 'Estudantes', Users], ['/admin/relatorios', 'Relatórios', BarChart3], ['/admin/configuracoes', 'Configurações', Settings],
] as const

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { displayName, signOut } = useAuth()
  const navigate = useNavigate()
  async function logout() { await signOut(); navigate('/', { replace: true }) }
  return <div className="min-h-screen bg-canvas">
    <header className="relative z-20 border-b border-line bg-surface"><div className="flex h-[88px] items-center justify-between px-6 lg:px-8"><div className="flex items-center gap-6"><button className="lg:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Fechar menu' : 'Abrir menu'}>{open ? <X /> : <Menu />}</button><Logo /></div><div className="flex items-center gap-3"><ThemeToggle /><span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">AD</span><span className="hidden text-sm sm:block">{displayName}</span><ChevronDown className="hidden sm:block" size={16} /></div></div></header>
    <div className="flex min-h-[calc(100vh-88px)]">
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-[88px] left-0 z-10 flex w-[264px] flex-col border-r border-line bg-surface p-5 transition-transform lg:sticky lg:top-0 lg:translate-x-0`}><p className="px-3 pb-4 text-[10px] font-semibold uppercase tracking-wider text-subtle">Administração</p><nav className="space-y-1" aria-label="Administração">{links.map(([to, label, Icon]) => <NavLink key={to} end={to === '/admin'} onClick={() => setOpen(false)} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-[10px] px-3 py-3 text-sm ${isActive ? 'bg-primary-soft font-semibold text-primary' : 'text-muted hover:bg-canvas hover:text-ink'}`}><Icon size={18} />{label}</NavLink>)}</nav><div className="mt-auto border-t border-line pt-4"><Link to="/" className="block px-3 py-2 text-xs text-muted">Ver site público</Link><button onClick={logout} className="flex w-full items-center gap-3 px-3 py-2 text-xs text-muted"><LogOut size={16} />Sair da conta</button></div></aside>
      {open && <button className="fixed inset-0 top-[88px] z-[5] bg-slate-950/30 lg:hidden" aria-label="Fechar navegação" onClick={() => setOpen(false)} />}
      <div className="min-w-0 flex-1"><Outlet /></div>
    </div>
  </div>
}
