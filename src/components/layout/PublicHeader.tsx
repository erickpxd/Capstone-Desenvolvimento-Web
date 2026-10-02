import { LogIn, Menu, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Logo } from '../ui/Logo'

export function PublicHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex h-[88px] items-center justify-between md:h-20">
        <Logo />
        <nav className="hidden items-center gap-10 text-sm text-slate-600 md:flex" aria-label="Navegação principal">
          <NavLink className={({ isActive }) => isActive ? 'text-primary' : 'hover:text-ink'} to="/">Início</NavLink>
          <NavLink className={({ isActive }) => isActive ? 'text-primary' : 'hover:text-ink'} to="/catalogo">Catálogo</NavLink>
          <a className="hover:text-ink" href="/#como-funciona">Como funciona</a>
        </nav>
        <div className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/entrar" className="inline-flex items-center gap-2 text-slate-700"><UserRound size={17} />Área do aluno</Link>
          <Link to="/entrar" className="btn-primary h-10"><LogIn size={17} />Entrar</Link>
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <Link to="/entrar" aria-label="Área do aluno" className="text-primary"><UserRound size={19} /></Link>
          <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Fechar menu' : 'Abrir menu'}>{open ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line bg-white px-6 py-4 text-sm md:hidden" aria-label="Menu móvel">
          <Link onClick={() => setOpen(false)} className="block py-2" to="/">Início</Link>
          <Link onClick={() => setOpen(false)} className="block py-2" to="/catalogo">Catálogo</Link>
          <a onClick={() => setOpen(false)} className="block py-2" href="/#como-funciona">Como funciona</a>
          <Link onClick={() => setOpen(false)} className="mt-2 flex h-11 items-center justify-center rounded-lg bg-primary font-semibold text-white" to="/entrar">Entrar</Link>
        </nav>
      )}
    </header>
  )
}
