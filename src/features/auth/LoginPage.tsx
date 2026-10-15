import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Eye, EyeOff, Globe, LockKeyhole, Mail } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from './AuthContext'
import { AuthField, AuthIntro, AuthShell } from './AuthShell'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const location = useLocation()
  const requestedPath = (location.state as { returnTo?: string } | null)?.returnTo
  const returnTo = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/minha-conta'

  const login = useMutation({
    mutationFn: async () => {
      await signIn({ email, password })
    },
    onSuccess: () => navigate(returnTo),
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    login.mutate()
  }

  return (
    <AuthShell>
      <AuthIntro title="Bom ter você de volta." description="Entre para solicitar livros e acompanhar seus empréstimos e reservas." />
      <form className="mt-7 space-y-[22px]" onSubmit={submit} noValidate><AuthField label="E-mail institucional"><Mail size={20} /><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.nome@universidade.edu.br" className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-subtle" /></AuthField><AuthField label="Senha"><LockKeyhole size={20} /><input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-subtle" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></AuthField><div className="flex items-center justify-between text-xs text-muted"><label className="flex items-center gap-2"><input type="checkbox" className="size-4 rounded border-line accent-primary" />Lembrar de mim</label><Link to="/recuperar-senha" className="font-medium text-primary">Esqueci minha senha</Link></div>{login.error && <div role="alert" className="rounded-[10px] bg-red-50 p-4 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">{login.error instanceof Error ? login.error.message : 'Não foi possível entrar.'}</div>}{!isSupabaseConfigured && <div role="status" className="rounded-[10px] bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 dark:bg-amber-950 dark:text-amber-200">Autenticação ainda não está conectada: adicione as variáveis do Supabase em <code>.env</code>.</div>}<button disabled={login.isPending || !isSupabaseConfigured} className="btn-primary w-full" type="submit"><ArrowRight size={20} />{login.isPending ? 'Entrando…' : 'Entrar'}</button></form>
      <p className="mt-7 text-center text-[13px] text-muted">Ainda não tem conta?</p><Link to="/cadastro" className="btn-outline mt-5 w-full">Criar conta institucional</Link><div className="mt-5 flex gap-3 rounded-[10px] bg-primary-soft p-4"><Globe size={20} className="shrink-0 text-primary" /><div><strong className="text-[13px]">Só quer descobrir um livro?</strong><p className="mt-1 text-xs leading-[1.55] text-muted">O catálogo é público. Você não precisa entrar para pesquisar.</p></div></div><Link to="/catalogo" className="mt-5 block text-center text-xs font-semibold text-primary">← Continuar sem login</Link><p className="mt-4 text-center text-[11px] leading-[1.55] text-subtle">Alunos e administradores usam este acesso. As permissões são definidas pelo seu perfil institucional.</p>
    </AuthShell>
  )
}
