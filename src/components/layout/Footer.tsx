import { MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'

export function Footer() {
  return (
    <>
      <section className="border-y border-line bg-primary-soft py-5">
        <div className="container-page flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex gap-3"><MessageSquare size={20} className="mt-0.5 text-primary" /><div><p className="text-sm font-semibold">Precisa encontrar um livro ou entender uma regra?</p><p className="mt-1 text-xs text-muted">Nossa equipe pode orientar sua pesquisa e o uso do acervo físico.</p></div></div>
          <button className="btn-outline h-10 w-full md:w-auto">Fale com a biblioteca</button>
        </div>
      </section>
      <footer className="bg-[#0B1428] py-10 text-white md:py-14">
        <div className="container-page">
          <div className="grid gap-9 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div><Logo /><p className="mt-5 max-w-xs text-xs leading-relaxed text-slate-300">Conhecimento aberto. Acervo universitário conectado à sua próxima descoberta.</p></div>
            <FooterList title="Explore" items={['Catálogo público', 'Gêneros', 'Como funciona']} />
            <FooterList title="Acesso protegido" items={['Área do aluno · entrar', 'Administração · entrar']} />
            <FooterList title="Precisa de ajuda?" items={['Fale com a biblioteca', 'Política de empréstimos', 'Privacidade e acessibilidade']} />
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-[10px] text-slate-400 md:flex-row md:justify-between"><span>© 2026 Biblioteca Online</span><span>Descoberta: Open Library · Acervo físico: biblioteca universitária</span></div>
        </div>
      </footer>
    </>
  )
}

function FooterList({ title, items }: { title: string; items: string[] }) {
  return <div><h3 className="text-xs font-semibold">{title}</h3><ul className="mt-3 space-y-2 text-[11px] text-slate-300">{items.map((item) => <li key={item}>{item.includes('Catálogo') ? <Link to="/catalogo">{item}</Link> : item}</li>)}</ul></div>
}
