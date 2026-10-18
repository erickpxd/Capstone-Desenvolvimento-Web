import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Eye, EyeOff, Info, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/supabase'
import { signUp } from './auth.service'
import { AuthField, AuthIntro, AuthShell } from './AuthShell'

export function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const registration = useMutation({
    mutationFn: async () => {
      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new Error('Use pelo menos 8 caracteres, com letras e números.')
      if (password !== confirmPassword) throw new Error('As senhas não coincidem.')
      if (!accepted) throw new Error('Aceite os termos de uso e a política de privacidade.')
      return signUp({ fullName, email, password })
    },
    onSuccess: ({ requiresEmailConfirmation }) => navigate(requiresEmailConfirmation ? '/entrar?cadastro=confirmar-email' : '/minha-conta', { replace: true }),
  })
  function submit(event: FormEvent) { event.preventDefault(); registration.mutate() }
  const inputClass = 'min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-subtle'

  return <AuthShell>
    <AuthIntro title="Seu próximo capítulo." description="Crie sua conta institucional para organizar leituras e acompanhar o acervo da universidade." />
    <form className="mt-6 space-y-5" onSubmit={submit} noValidate>
      <AuthField label="Nome completo"><UserRound size={20} /><input className={inputClass} required autoComplete="name" placeholder="Ana Martins" value={fullName} onChange={(e) => setFullName(e.target.value)} /></AuthField>
      <AuthField label="E-mail institucional"><Mail size={20} /><input className={inputClass} required type="email" autoComplete="email" placeholder="ana.martins@universidade.edu.br" value={email} onChange={(e) => setEmail(e.target.value)} /></AuthField>
      <AuthField label="Senha" hint="Use 8 ou mais caracteres, com letras e números."><LockKeyhole size={20} /><input className={inputClass} required type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Crie uma senha" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></AuthField>
      <AuthField label="Confirmação de senha"><LockKeyhole size={20} /><input className={inputClass} required type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Repita a senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></AuthField>
      <label className="flex items-start gap-2.5 text-xs leading-[1.55] text-muted"><input className="mt-0.5 size-4 accent-primary" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />Li e aceito os termos de uso e a política de privacidade.</label>
      {registration.error && <p role="alert" className="rounded-[10px] bg-red-50 p-4 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">{registration.error instanceof Error ? registration.error.message : 'Não foi possível criar a conta.'}</p>}
      <button className="btn-primary w-full" disabled={!isSupabaseConfigured || registration.isPending}><ArrowRight size={20} />{registration.isPending ? 'Criando conta…' : 'Criar conta institucional'}</button>
    </form>
    <p className="mt-6 text-center text-[13px] text-muted">Já tem uma conta? <Link to="/entrar" className="font-semibold text-primary">Entrar</Link></p>
    <div className="mt-5 flex gap-3 rounded-[10px] bg-primary-soft p-4"><Info size={20} className="shrink-0 text-primary" /><div><strong className="text-[13px]">O catálogo continua aberto</strong><p className="mt-1 text-xs leading-[1.55] text-muted">Você não precisa de uma conta para descobrir livros. Empréstimos e reservas são exclusivos do acervo universitário.</p></div></div>
    <Link to="/catalogo" className="mt-5 block text-[13px] font-semibold text-primary">← Voltar ao catálogo</Link>
  </AuthShell>
}
