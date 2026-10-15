import { useQuery } from '@tanstack/react-query'
import { BookOpen, Bookmark, Heart, Info, Library, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookCard } from '../../components/books/BookCard'
import { searchOpenLibraryBooks } from '../../services/openLibrary'
import { useAuth } from '../auth/AuthContext'
import { AccountPageIntro } from './AccountLayout'

const unavailableMessage = 'O Supabase deste projeto ainda não possui a tabela necessária. Por isso, nenhum dado pessoal é presumido ou simulado.'

export function StudentDashboardPage() {
  const { displayName, user } = useAuth()
  const recommendations = useQuery({
    queryKey: ['open-library', 'account-recommendations'],
    queryFn: ({ signal }) => searchOpenLibraryBooks({ query: 'literatura brasileira', language: 'por', pageSize: 4, signal }),
  })
  const firstName = displayName.trim().split(/\s+/)[0] || 'Estudante'
  const today = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())
  const stats = [
    ['Empréstimos ativos', '0', 'Nenhum registro encontrado', BookOpen],
    ['Reservas ativas', '0', 'Nenhum registro encontrado', Bookmark],
    ['Lista de desejos', '0', 'Nenhum livro salvo', Heart],
    ['Minhas leituras', '0', 'Nenhum progresso registrado', Library],
  ] as const

  return <AccountMain>
    <AccountPageIntro path="Meu painel" title={`Olá, ${firstName}. Que bom ter você aqui.`} description="Sua conta e o catálogo público da Open Library, em um só lugar." />
    <p className="text-xs capitalize text-subtle">{today} · {user?.email}</p>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, caption, Icon]) => <article className="card p-[18px] shadow-card" key={label}><div className="flex min-h-10 justify-between text-[13px] text-muted"><span>{label}</span><Icon size={16} className="text-primary" /></div><strong className="mt-4 block text-4xl">{value}</strong><p className="mt-5 text-xs text-subtle">{caption}</p></article>)}</div>
    <DataNotice />
    <div className="grid gap-6 lg:grid-cols-2"><Panel title="Prazos de devolução" action="Meus empréstimos →" to="/minha-conta/emprestimos"><CompactEmpty text="Você não possui empréstimos registrados." /></Panel><Panel title="Suas reservas" action="Minhas reservas →" to="/minha-conta/reservas"><CompactEmpty text="Você não possui reservas registradas." /></Panel></div>
    <div className="grid gap-6 md:grid-cols-2"><QuickLink icon={<Heart />} title="Guarde sua próxima descoberta" text="Sua lista está vazia enquanto não há armazenamento configurado." to="/minha-conta/desejos" /><QuickLink icon={<BookOpen />} title="Organize suas leituras" text="Nenhum progresso de leitura foi registrado." to="/minha-conta/leituras" /></div>
    <section><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">Open Library</p><h2 className="mt-3 text-[28px]">Sugestões reais do catálogo público.</h2></div><Link to="/catalogo" className="text-xs font-semibold text-primary">Ver catálogo →</Link></div>{recommendations.isLoading ? <p role="status" className="text-sm text-muted">Consultando a Open Library…</p> : recommendations.isError ? <p role="alert" className="text-sm text-red-700">Não foi possível carregar sugestões agora.</p> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{recommendations.data?.books.map((book) => <BookCard key={book.id} book={book} dense />)}</div>}</section>
  </AccountMain>
}

export function LoansPage() { return <EmptyAccountPage path="Meus empréstimos" title="Cada livro, no seu prazo." description="Acompanhe somente empréstimos realmente vinculados à sua conta." heading="Nenhum empréstimo registrado" text="Quando a universidade configurar o acervo interno e registrar um empréstimo para seu usuário, ele aparecerá aqui."><Link className="btn-outline" to="/catalogo">Explorar catálogo</Link></EmptyAccountPage> }
export function ReservationsPage() { return <EmptyAccountPage path="Minhas reservas" title="Sua próxima leitura está a caminho." description="Acompanhe somente reservas reais do acervo físico." heading="Nenhuma reserva registrada" text="Pesquisar na Open Library não cria uma reserva. As reservas aparecerão quando o módulo do acervo interno estiver configurado." /> }
export function WishlistPage() { return <EmptyAccountPage path="Lista de desejos" title="Guarde o que desperta sua curiosidade." description="Sua lista pessoal ainda não possui armazenamento no Supabase." heading="Sua lista está vazia" text="Nenhum livro foi salvo para esta conta. Você ainda pode explorar o catálogo público da Open Library."><Link className="btn-outline" to="/catalogo"><Search size={18} />Descobrir livros</Link></EmptyAccountPage> }
export function ReadingPage() { return <EmptyAccountPage path="Minhas leituras" title="Uma página de cada vez." description="O progresso deve pertencer exclusivamente ao usuário autenticado." heading="Nenhuma leitura registrada" text="Nenhum progresso é exibido porque a tabela de leituras ainda não existe no Supabase." /> }

function EmptyAccountPage({ path, title, description, heading, text, children }: { path: string; title: string; description: string; heading: string; text: string; children?: ReactNode }) { return <AccountMain><AccountPageIntro path={path} title={title} description={description}>{children}</AccountPageIntro><DataNotice /><section className="card flex min-h-72 flex-col items-center justify-center p-8 text-center shadow-card"><span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary"><BookOpen /></span><h2 className="mt-5 text-xl font-semibold">{heading}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted">{text}</p></section></AccountMain> }
function DataNotice() { return <div className="flex gap-3 rounded-[10px] bg-primary-soft p-4"><Info size={20} className="shrink-0 text-primary" /><div><strong className="text-[13px]">Sem dados fictícios</strong><p className="mt-1 text-xs leading-[1.55] text-muted">{unavailableMessage}</p></div></div> }
function AccountMain({ children }: { children: ReactNode }) { return <main className="container-page flex flex-col gap-8 py-10 md:py-12">{children}</main> }
function Panel({ title, action, to, children }: { title: string; action: string; to: string; children: ReactNode }) { return <section className="card p-6 shadow-card"><div className="flex items-center justify-between"><h2 className="text-[22px] font-semibold">{title}</h2><Link to={to} className="text-xs font-semibold text-primary">{action}</Link></div><div className="mt-3">{children}</div></section> }
function CompactEmpty({ text }: { text: string }) { return <p className="border-t border-line py-6 text-sm text-muted">{text}</p> }
function QuickLink({ icon, title, text, to }: { icon: ReactNode; title: string; text: string; to: string }) { return <Link to={to} className="card flex gap-4 p-5 shadow-card"><span className="text-primary">{icon}</span><span><strong className="text-sm">{title}</strong><small className="mt-1 block text-xs text-subtle">{text}</small><small className="mt-2 block font-semibold text-primary">Abrir →</small></span></Link> }
