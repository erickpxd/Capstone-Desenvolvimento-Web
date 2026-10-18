import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'

export function Footer() {
  return (
      <footer className="bg-[#0B1428] py-10 text-white md:py-14">
        <div className="container-page">
          <div className="grid gap-9 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div><Logo /><p className="mt-5 max-w-xs text-xs leading-relaxed text-slate-300">Conhecimento aberto. Acervo universitário conectado à sua próxima descoberta.</p></div>
            <FooterList title="Explore" items={[['Catálogo', '/catalogo'], ['Como funciona', '/#como-funciona']]} />
            <FooterList title="Minha biblioteca" items={[['Entrar', '/entrar'], ['Criar conta', '/cadastro']]} />
            <FooterList title="Conta" items={[['Empréstimos', '/minha-conta/emprestimos'], ['Reservas', '/minha-conta/reservas']]} />
          </div>
          <div className="mt-10 border-t border-slate-800 pt-6 text-[10px] text-slate-400">© 2026 Biblioteca Online</div>
        </div>
      </footer>
  )
}

function FooterList({ title, items }: { title: string; items: Array<[string, string]> }) {
  return <div><h2 className="text-xs font-semibold">{title}</h2><ul className="mt-3 space-y-2 text-[11px] text-slate-300">{items.map(([label, to]) => <li key={to}><Link className="hover:text-white" to={to}>{label}</Link></li>)}</ul></div>
}
