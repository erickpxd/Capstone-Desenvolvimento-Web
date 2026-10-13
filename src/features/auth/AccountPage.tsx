import { useMutation } from '@tanstack/react-query'
import { Bell, KeyRound, LogOut, Save, ShieldCheck, UserRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccountPageIntro } from '../account/AccountLayout'
import { signInWithPassword, updatePassword, updateProfile } from './auth.service'
import { useAuth } from './AuthContext'

export function AccountPage() {
  const { user, displayName, signOut } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(displayName)
  const [notifications, setNotifications] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const profile = useMutation({ mutationFn: () => updateProfile(fullName) })
  const password = useMutation({
    mutationFn: async () => {
      if (!currentPassword) throw new Error('Informe sua senha atual para confirmar a alteração.')
      if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) throw new Error('Use pelo menos 8 caracteres, com letras e números.')
      if (!user?.email) throw new Error('Sua sessão não contém um e-mail válido.')
      await signInWithPassword({ email: user.email, password: currentPassword })
      await updatePassword(newPassword)
    },
    onSuccess: () => { setCurrentPassword(''); setNewPassword('') },
  })
  const logout = useMutation({ mutationFn: signOut, onSuccess: () => navigate('/', { replace: true }) })

  return <main className="container-page flex flex-col gap-8 py-10 md:py-12">
    <AccountPageIntro path="Meu perfil" title="Seu espaço, do seu jeito." description="Mantenha seus dados de acesso e preferências sempre atualizados." />
    <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
      <section className="card p-6 shadow-card md:p-8">
        <div className="flex items-center gap-4"><span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary"><UserRound /></span><div><h2 className="text-xl font-semibold">Informações pessoais</h2><p className="mt-1 text-xs text-muted">Dados da sua conta institucional.</p></div></div>
        <form className="mt-7 space-y-5" onSubmit={(event: FormEvent) => { event.preventDefault(); profile.mutate() }}>
          <label className="block text-xs font-semibold">Nome completo<input className="mt-2 h-12 w-full rounded-[10px] border border-line bg-surface px-4 text-sm" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>
          <label className="block text-xs font-semibold">E-mail institucional<input className="mt-2 h-12 w-full rounded-[10px] border border-line bg-canvas px-4 text-sm text-muted" value={user?.email ?? ''} disabled /></label>
          <p className="text-[11px] text-subtle">Para alterar o e-mail, procure a secretaria acadêmica.</p>
          {profile.isSuccess && <Feedback success>Informações atualizadas com sucesso.</Feedback>}
          {profile.error && <Feedback>{profile.error.message}</Feedback>}
          <button className="btn-primary" disabled={profile.isPending}><Save size={17} />{profile.isPending ? 'Salvando…' : 'Salvar alterações'}</button>
        </form>
      </section>
      <aside className="space-y-6">
        <section className="card p-6 shadow-card"><div className="flex items-center gap-3"><Bell className="text-primary" /><h2 className="font-semibold">Preferências</h2></div><label className="mt-5 flex cursor-pointer items-start justify-between gap-4 text-sm"><span><strong className="block">Avisos por e-mail</strong><small className="mt-1 block leading-5 text-muted">Prazos, reservas disponíveis e comunicados da biblioteca.</small></span><input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} className="mt-1 size-4 accent-blue-600" /></label><p className="mt-5 text-[11px] text-subtle">Preferência salva somente nesta demonstração até a tabela de perfis ser criada.</p></section>
        <section className="card p-6 shadow-card"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" /><div><h2 className="font-semibold">Conta protegida</h2><p className="mt-1 text-xs text-muted">Sessão autenticada pelo Supabase.</p></div></div>{logout.error && <p role="alert" className="mt-4 text-xs text-red-700">{logout.error.message}</p>}<button className="btn-outline mt-5 w-full" onClick={() => logout.mutate()} disabled={logout.isPending}><LogOut size={17} />{logout.isPending ? 'Saindo…' : 'Sair da conta'}</button></section>
      </aside>
    </div>
    <section className="card max-w-3xl p-6 shadow-card md:p-8">
      <div className="flex items-center gap-4"><span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary"><KeyRound /></span><div><h2 className="text-xl font-semibold">Alterar senha</h2><p className="mt-1 text-xs text-muted">Escolha uma senha diferente da anterior.</p></div></div>
      <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); password.mutate() }}><label className="text-xs font-semibold">Senha atual<input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2 h-12 w-full rounded-[10px] border border-line bg-surface px-4" /></label><label className="text-xs font-semibold">Nova senha<input type="password" autoComplete="new-password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2 h-12 w-full rounded-[10px] border border-line bg-surface px-4" /></label><div className="sm:col-span-2">{password.isSuccess && <Feedback success>Senha alterada com sucesso.</Feedback>}{password.error && <Feedback>{password.error.message}</Feedback>}<button className="btn-primary mt-4" disabled={password.isPending}>{password.isPending ? 'Alterando…' : 'Alterar senha'}</button></div></form>
    </section>
  </main>
}

function Feedback({ children, success = false }: { children: string; success?: boolean }) {
  return <p role="status" className={`rounded-[10px] p-3 text-xs ${success ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'}`}>{children}</p>
}
