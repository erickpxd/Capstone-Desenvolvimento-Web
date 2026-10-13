import { useMutation } from '@tanstack/react-query'
import { CircleCheck, Eye, EyeOff, Info, LockKeyhole, LogIn, Mail, MailCheck, ShieldCheck } from 'lucide-react'
import { type FormEvent, type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/supabase'
import { requestPasswordReset, updatePassword } from './auth.service'
import { AuthField, AuthIntro, AuthShell } from './AuthShell'

export function PasswordRecoveryPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const recovery = useMutation({ mutationFn: () => requestPasswordReset(email), onSuccess: () => setSent(true) })
  if (sent) return <RecoverySent email={email} resend={() => recovery.mutate()} pending={recovery.isPending} />
  return <AuthShell><AuthIntro step="1 de 3 · Solicitar link" title="Vamos recuperar seu acesso." description="Informe o e-mail da sua conta para receber um link de recuperação." />
    <form className="mt-6 space-y-5" onSubmit={(event: FormEvent) => { event.preventDefault(); recovery.mutate() }}>
      <AuthField label="E-mail institucional" hint="Use o endereço vinculado à sua conta."><Mail size={20} /><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana.martins@universidade.edu.br" className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-subtle" /></AuthField>
      {recovery.error && <p role="alert" className="rounded-[10px] bg-red-50 p-4 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">Não foi possível enviar o link. Tente novamente.</p>}
      <button disabled={!isSupabaseConfigured || recovery.isPending} className="btn-primary w-full">{recovery.isPending ? 'Enviando…' : 'Enviar link de recuperação'}</button>
    </form>
    <InfoBox icon={<Info size={20} />} title="Recuperação segura">Por segurança, a confirmação será a mesma para endereços cadastrados ou não.</InfoBox>
    <RecoveryLinks />
  </AuthShell>
}

function RecoverySent({ email, resend, pending }: { email: string; resend: () => void; pending: boolean }) {
  return <AuthShell><p className="text-xs font-semibold text-primary">1 de 3 · Confira seu e-mail</p><span className="mt-6 flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary"><MailCheck size={28} /></span><div className="mt-6"><AuthIntro title="Confira seu e-mail." description="Se este endereço estiver cadastrado, você receberá um link para criar uma nova senha." /></div><div className="mt-6 rounded-2xl border border-line bg-canvas p-5"><p className="text-xs text-subtle">E-mail informado</p><p className="mt-2 text-sm font-medium">{email}</p></div><p className="mt-5 text-sm leading-[1.55] text-muted">Verifique também a pasta de spam. Abra o link recebido para definir sua nova senha.</p><button type="button" onClick={resend} disabled={pending} className="btn-outline mt-5 w-full">{pending ? 'Reenviando…' : 'Reenviar e-mail'}</button><button type="button" onClick={() => window.location.reload()} className="mt-5 block text-[13px] font-semibold text-primary">Corrigir endereço de e-mail</button><RecoveryLinks /></AuthShell>
}

export function NewPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)
  const location = useLocation()
  const recovery = useMutation({ mutationFn: async () => { if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new Error('A senha precisa ter ao menos 8 caracteres, letras e números.'); if (password !== confirmation) throw new Error('As senhas não coincidem.'); await updatePassword(password) }, onSuccess: () => setSaved(true) })
  if (saved) return <PasswordSaved />
  return <AuthShell><AuthIntro step="2 de 3 · Criar nova senha" title="Um novo começo." description="Crie uma senha segura para voltar à sua biblioteca." /><form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); recovery.mutate() }}><AuthField label="Nova senha"><LockKeyhole size={20} /><input required autoComplete="new-password" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" /><button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>{show ? <EyeOff size={20} /> : <Eye size={20} />}</button></AuthField><ul className="space-y-1.5 text-xs text-emerald-700 dark:text-emerald-300"><li>✓ Pelo menos 8 caracteres</li><li>✓ Letras e números</li><li>✓ Diferente da senha anterior</li></ul><AuthField label="Confirmação de nova senha"><LockKeyhole size={20} /><input required autoComplete="new-password" type={show ? 'text' : 'password'} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" /></AuthField>{recovery.error && <p role="alert" className="rounded-[10px] bg-red-50 p-4 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">{recovery.error instanceof Error ? recovery.error.message : 'Não foi possível salvar a senha.'}</p>}<button disabled={recovery.isPending} className="btn-primary w-full">{recovery.isPending ? 'Salvando…' : 'Salvar nova senha'}</button></form><p className="mt-5 text-xs text-subtle">Este link é pessoal. Não compartilhe seu acesso ou sua senha.</p>{!location.hash && <p className="mt-4 rounded-[10px] bg-amber-50 p-4 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">Abra esta página pelo link enviado ao seu e-mail para confirmar a sessão de recuperação.</p>}<RecoveryLinks /></AuthShell>
}

function PasswordSaved() { return <AuthShell><p className="text-xs font-semibold text-primary">3 de 3 · Acesso recuperado</p><span className="mt-6 flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><ShieldCheck size={28} /></span><div className="mt-6"><AuthIntro title="Seu acesso está pronto." description="Sua nova senha foi salva. Entre novamente para acessar a área do aluno." /></div><InfoBox icon={<CircleCheck size={20} />} title="Nova senha salva" success>Use sua nova senha no próximo acesso. Seus empréstimos, reservas e listas foram preservados.</InfoBox><Link className="btn-primary mt-5 w-full" to="/entrar"><LogIn size={20} />Voltar para entrar</Link><p className="mt-5 text-[13px] leading-[1.55] text-muted">A recuperação não realiza empréstimos ou reservas. Suas solicitações continuam na área do aluno.</p><Link to="/catalogo" className="mt-5 block text-[13px] font-semibold text-primary">Continuar no catálogo público →</Link></AuthShell> }

function RecoveryLinks() { return <div className="mt-5 space-y-5 text-[13px] font-semibold text-primary"><Link className="block" to="/entrar">← Voltar para entrar</Link><Link className="block" to="/catalogo">Continuar no catálogo público →</Link></div> }
function InfoBox({ icon, title, children, success = false }: { icon: ReactNode; title: string; children: ReactNode; success?: boolean }) { return <div className={`mt-5 flex gap-3 rounded-[10px] p-4 ${success ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-primary-soft'}`}><span className={success ? 'text-emerald-700 dark:text-emerald-300' : 'text-primary'}>{icon}</span><div><strong className="text-[13px]">{title}</strong><p className="mt-1 text-xs leading-[1.55] text-muted">{children}</p></div></div> }
