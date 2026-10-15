import { Menu, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { AccountNavigation } from '../../components/layout/AccountNavigation'
import { Logo } from '../../components/ui/Logo'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { AuthenticatedUserMenu } from '../../components/layout/AuthenticatedUserMenu'

export function AccountLayout() {
  const [open, setOpen] = useState(false)
  return <div className="flex min-h-screen flex-col bg-canvas">
    <header className="border-b border-line bg-surface">
      <div className="container-page flex h-[88px] items-center justify-between">
        <Logo />
        <nav className="hidden gap-[30px] text-sm text-muted lg:flex" aria-label="Navegação pública"><Link to="/">Início</Link><Link to="/catalogo">Catálogo</Link><Link to="/#como-funciona">Como funciona</Link></nav>
        <div className="flex items-center gap-3"><ThemeToggle /><AuthenticatedUserMenu /><button className="lg:hidden" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button></div>
      </div>
      <nav className={`${open ? 'flex' : 'hidden'} container-page flex-col border-t border-line py-3 text-sm lg:hidden`}><Link className="py-2" to="/">Início</Link><Link className="py-2" to="/catalogo">Catálogo</Link></nav>
    </header>
    <div className="border-b border-line"><AccountNavigation /></div>
    <main className="flex-1"><Outlet /></main>
    <footer className="flex min-h-[69px] items-center bg-[#0f172a] text-[11px] text-slate-300"><div className="container-page flex flex-col gap-2 py-6 sm:flex-row sm:justify-between"><span>© 2026 Biblioteca Online</span><span>Privacidade · Acessibilidade · Ajuda</span></div></footer>
  </div>
}

export function AccountPageIntro({ path, title, description, children }: { path: string; title: string; description: string; children?: ReactNode }) {
  return <><p className="text-xs text-subtle">Área do aluno / {path}</p><div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><h1 className="text-[34px] font-normal leading-[1.15] md:text-[44px]">{title}</h1><p className="mt-3 text-base text-muted">{description}</p></div>{children}</div></>
}
