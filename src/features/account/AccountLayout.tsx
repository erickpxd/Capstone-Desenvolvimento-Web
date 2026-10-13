import { ChevronDown, Menu, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Logo } from '../../components/ui/Logo'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { useAuth } from '../auth/AuthContext'

const accountLinks = [
  ['/minha-conta', 'Meu painel'],
  ['/minha-conta/emprestimos', 'Meus empréstimos'],
  ['/minha-conta/reservas', 'Minhas reservas'],
  ['/minha-conta/desejos', 'Lista de desejos'],
  ['/minha-conta/leituras', 'Minhas leituras'],
  ['/minha-conta/perfil', 'Meu perfil'],
] as const

export function AccountLayout() {
  const { displayName } = useAuth()
  const [open, setOpen] = useState(false)
  const initials = displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  return <div className="min-h-screen bg-canvas">
    <header className="border-b border-line bg-surface">
      <div className="container-page flex h-[88px] items-center justify-between">
        <Logo />
        <nav className="hidden gap-[30px] text-sm text-muted lg:flex" aria-label="Navegação pública"><Link to="/">Início</Link><Link to="/catalogo">Catálogo</Link><Link to="/#como-funciona">Como funciona</Link></nav>
        <div className="flex items-center gap-3"><ThemeToggle /><span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{initials || 'AM'}</span><span className="hidden text-sm md:inline">{displayName}</span><ChevronDown className="hidden md:block" size={16} /><button className="lg:hidden" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button></div>
      </div>
      <nav className={`${open ? 'flex' : 'hidden'} container-page flex-col border-t border-line py-3 text-sm lg:hidden`}><Link className="py-2" to="/">Início</Link><Link className="py-2" to="/catalogo">Catálogo</Link></nav>
    </header>
    <nav className="overflow-x-auto border-b border-line bg-surface" aria-label="Área do aluno"><div className="container-page flex min-w-max gap-8">{accountLinks.map(([to, label]) => <NavLink key={to} end={to === '/minha-conta'} to={to} className={({ isActive }) => `flex h-16 items-center border-b-2 text-sm ${isActive ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted hover:text-ink'}`}>{label}</NavLink>)}</div></nav>
    <Outlet />
    <footer className="flex min-h-[69px] items-center bg-[#0f172a] text-[11px] text-slate-300"><div className="container-page flex flex-col gap-2 py-6 sm:flex-row sm:justify-between"><span>© 2026 Biblioteca Online</span><span>Privacidade · Acessibilidade · Ajuda</span></div></footer>
  </div>
}

export function AccountPageIntro({ path, title, description, children }: { path: string; title: string; description: string; children?: ReactNode }) {
  return <><p className="text-xs text-subtle">Área do aluno / {path}</p><div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><h1 className="text-[34px] font-normal leading-[1.15] md:text-[44px]">{title}</h1><p className="mt-3 text-base text-muted">{description}</p></div>{children}</div></>
}
