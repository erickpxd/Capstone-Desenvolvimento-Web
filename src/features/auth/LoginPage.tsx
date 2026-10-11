import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Globe, LockKeyhole, Mail, ShieldCheck, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../../components/ui/Logo'
import { isSupabaseConfigured } from '../../lib/supabase'
import { signInWithPassword } from './auth.service'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const requestedPath = (location.state as { returnTo?: string } | null)?.returnTo
  const returnTo = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/'

  const login = useMutation({
    mutationFn: async () => {
      await signInWithPassword({ email, password })
    },
    onSuccess: () => navigate(returnTo),
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    login.mutate()
  }

  return (
    <main className="min-h-screen bg-surface">
      <header className="mx-auto flex h-[88px] max-w-[1360px] items-center justify-between px-6 md:px-10"><Logo /><Link to="/catalogo" className="hidden items-center gap-2 text-sm text-primary md:flex"><ArrowLeft size={17} />Voltar ao catálogo público</Link><Link to="/catalogo" className="md:hidden" aria-label="Fechar e voltar ao catálogo"><X size={22} /></Link></header>
      <div className="mx-auto grid max-w-[1360px] gap-12 px-6 pb-12 md:grid-cols-[1fr_1.04fr] md:px-10">
        <aside className="relative hidden min-h-[816px] overflow-hidden rounded-3xl md:block"><img src="/assets/login-library.png" alt="Biblioteca com uma mesa de leitura" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#071124] via-transparent" /><div className="absolute inset-x-12 bottom-12 text-white"><p className="text-[11px] uppercase text-slate-200">Conhecimento que acompanha você</p><h1 className="mt-6 text-[44px] font-semibold leading-tight">Cada leitura abre uma possibilidade.</h1><p className="mt-6 text-sm leading-relaxed text-slate-200">Seu acesso conecta o catálogo ao acervo da universidade. Empréstimos e reservas, em um só lugar.</p><p className="mt-8 flex items-center gap-2 text-xs text-slate-200"><ShieldCheck size={17} />Área exclusiva para alunos e administradores</p></div></aside>
        <section className="mx-auto w-full max-w-[448px] pt-5 md:pt-14">
          <p className="eyebrow">Acesso institucional</p><h1 className="mt-4 text-[38px] font-normal leading-[1.12] md:text-[44px]">Bom ter você de volta.</h1><p className="mt-4 text-sm leading-relaxed text-muted">Entre para solicitar livros e acompanhar seus empréstimos e reservas.</p>
          <form className="mt-9" onSubmit={submit} noValidate><Field label="E-mail institucional"><Mail size={20} /><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.nome@universidade.edu.br" className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-subtle" /></Field><Field label="Senha"><LockKeyhole size={20} /><input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-subtle" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></Field><div className="mt-4 flex items-center justify-between text-xs text-muted"><label className="flex items-center gap-2"><input type="checkbox" className="size-4 rounded border-line accent-primary" />Lembrar de mim</label><button type="button" className="font-medium text-primary">Esqueci minha senha</button></div>{login.error && <div role="alert" className="mt-5 rounded-[10px] bg-red-50 p-4 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">{login.error instanceof Error ? login.error.message : 'Não foi possível entrar.'}</div>}{!isSupabaseConfigured && <div role="status" className="mt-5 rounded-[10px] bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:bg-amber-950 dark:text-amber-200">Autenticação ainda não está conectada: adicione as variáveis do Supabase em <code>.env</code>.</div>}<button disabled={login.isPending || !isSupabaseConfigured} className="btn-primary mt-5 w-full" type="submit"><ArrowRight size={20} />{login.isPending ? 'Entrando…' : 'Entrar'}</button></form>
          <p className="mt-8 text-center text-sm text-muted">Ainda não tem conta?</p><button type="button" className="btn-outline mt-5 w-full">Criar conta institucional</button><div className="mt-7 flex gap-3 rounded-[10px] bg-primary-soft p-5"><Globe size={20} className="shrink-0 text-primary" /><div><strong className="text-sm">Só quer descobrir um livro?</strong><p className="mt-1 text-xs leading-relaxed text-muted">O catálogo é público. Você não precisa entrar para pesquisar.</p></div></div><Link to="/catalogo" className="mt-7 block text-center text-xs font-semibold text-primary">← Continuar sem login</Link><p className="mt-5 text-center text-[11px] leading-relaxed text-subtle">Alunos e administradores usam este acesso. As permissões são definidas pelo seu perfil institucional.</p>
        </section>
      </div>
      <footer className="mx-auto flex max-w-[1360px] flex-col gap-4 px-6 pb-8 text-[11px] text-subtle md:flex-row md:justify-between md:px-10"><span>© 2026 Biblioteca Online</span><span>Privacidade · Acessibilidade · Ajuda</span></footer>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="mb-5 block text-sm font-medium"><span>{label}</span><span className="mt-2 flex h-[52px] items-center gap-3 rounded-[10px] border border-line bg-surface px-4 text-sm font-normal text-subtle focus-within:border-primary">{children}</span></label> }
