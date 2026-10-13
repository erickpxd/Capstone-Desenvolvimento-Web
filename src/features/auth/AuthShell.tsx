import type { PropsWithChildren } from 'react'
import { ArrowLeft, ShieldCheck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../../components/ui/Logo'

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen bg-surface">
      <header className="mx-auto flex h-[88px] max-w-[1360px] items-center justify-between px-6 md:px-10">
        <Logo />
        <Link to="/catalogo" className="hidden items-center gap-2 text-[13px] font-medium text-primary md:flex"><ArrowLeft size={16} />Voltar ao catálogo público</Link>
        <Link to="/catalogo" className="md:hidden" aria-label="Fechar e voltar ao catálogo"><X size={22} /></Link>
      </header>
      <div className="mx-auto grid max-w-[1360px] gap-12 px-6 pb-12 md:grid-cols-[minmax(0,624px)_minmax(360px,448px)] md:items-center md:justify-center md:px-10">
        <aside className="relative hidden h-[816px] overflow-hidden rounded-3xl md:block">
          <img src="/assets/login-library.png" alt="Biblioteca com uma mesa de leitura" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-10% to-[#0f172af0]" />
          <div className="absolute inset-x-12 bottom-12 text-white">
            <p className="text-[11px] uppercase text-slate-300">Conhecimento que acompanha você</p>
            <h1 className="mt-[22px] text-5xl font-semibold leading-[1.1]">Cada leitura abre uma possibilidade.</h1>
            <p className="mt-[22px] text-[15px] leading-[1.55] text-slate-300">Seu acesso conecta o catálogo ao acervo da universidade. Empréstimos e reservas, em um só lugar.</p>
            <p className="mt-[22px] flex items-center gap-2 text-xs text-slate-300"><ShieldCheck size={18} />Área do aluno · acesso protegido</p>
          </div>
        </aside>
        <section className="mx-auto w-full max-w-[448px] py-5 md:py-12">{children}</section>
      </div>
      <footer className="mx-auto flex max-w-[1360px] flex-col gap-4 px-6 pb-8 text-[11px] text-subtle md:flex-row md:justify-between md:px-10"><span>© 2026 Biblioteca Online</span><span>Privacidade · Acessibilidade · Ajuda</span></footer>
    </main>
  )
}

export function AuthIntro({ step, title, description }: { step?: string; title: string; description: string }) {
  return <div>{step && <p className="mb-6 text-xs font-semibold text-primary">{step}</p>}<p className="eyebrow">Acesso institucional</p><h1 className="mt-3 text-[38px] font-normal leading-[1.15]">{title}</h1><p className="mt-3 text-sm leading-[1.55] text-muted">{description}</p></div>
}

export function AuthField({ label, hint, children }: PropsWithChildren<{ label: string; hint?: string }>) {
  return <label className="block text-sm font-medium"><span>{label}</span><span className="mt-2 flex h-[52px] items-center gap-3 rounded-[10px] border border-line bg-surface px-3.5 text-sm font-normal text-subtle focus-within:border-primary">{children}</span>{hint && <span className="mt-2 block text-xs font-normal leading-[1.55] text-subtle">{hint}</span>}</label>
}
