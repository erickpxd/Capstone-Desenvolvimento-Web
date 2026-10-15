import { NavLink } from 'react-router-dom'

const accountLinks = [
  ['/minha-conta', 'Meu painel'],
  ['/minha-conta/emprestimos', 'Meus empréstimos'],
  ['/minha-conta/reservas', 'Minhas reservas'],
  ['/minha-conta/desejos', 'Lista de desejos'],
  ['/minha-conta/leituras', 'Minhas leituras'],
  ['/minha-conta/perfil', 'Meu perfil'],
] as const

export function AccountNavigation() {
  return <nav className="overflow-x-auto border-t border-line bg-surface" aria-label="Área do aluno"><div className="container-page flex min-w-max gap-8">{accountLinks.map(([to, label]) => <NavLink key={to} end={to === '/minha-conta'} to={to} className={({ isActive }) => `flex h-16 items-center border-b-2 text-sm ${isActive ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted hover:text-ink'}`}>{label}</NavLink>)}</div></nav>
}
