import { useQuery } from '@tanstack/react-query'
import { Globe, Library, RefreshCw, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { BookCard } from '../../components/books/BookCard'
import { BookCover } from '../../components/books/BookCover'
import { StatusPill } from '../../components/ui/StatusPill'
import { getOpenLibraryWork, searchOpenLibraryBooks } from '../../services/openLibrary'
import type { Book } from '../../types/book'

export function BookDetailsPage() {
  const { bookId } = useParams()
  const work = useQuery({ queryKey: ['open-library', 'work', bookId], queryFn: ({ signal }) => getOpenLibraryWork(bookId!, signal), enabled: Boolean(bookId) })
  const related = useQuery({ queryKey: ['open-library', 'related', work.data?.author], queryFn: ({ signal }) => searchOpenLibraryBooks({ query: work.data?.author, pageSize: 4, signal }), enabled: Boolean(work.data?.author) })

  if (work.isLoading) return <DetailState title="Consultando a Open Library…" />
  if (work.isError || !work.data) return <DetailState title="Não foi possível carregar este livro" retry={() => work.refetch()} />
  const book = work.data

  return (
    <>
      <section className="py-7 md:py-12"><div className="container-page"><p className="text-xs text-subtle">Início / Catálogo / {book.title}</p><div className="mt-7 grid items-start gap-8 md:grid-cols-[250px_1fr_320px] md:gap-10">
        <div className="flex flex-col items-center rounded-2xl bg-stage p-7"><BookCover book={book} large /><span className="mt-6 text-center text-[10px] text-subtle">Capa ilustrativa · a edição física pode variar</span></div>
        <div><span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-semibold text-primary">{book.category}</span><h1 className="mt-5 text-[40px] font-normal leading-tight md:text-[48px]">{book.title}</h1><p className="mt-2 text-base text-muted">{book.author}</p><div className="mt-5 flex gap-5 border-b border-line pb-5 text-xs text-subtle"><span>{book.year ?? 'Ano não informado'}</span><span>{book.language}</span></div><p className="mt-6 text-sm leading-[1.65] text-muted">{book.description ?? 'A Open Library ainda não possui uma descrição disponível para esta obra.'}</p><p className="mt-5 flex items-center gap-2 text-xs text-muted"><Globe size={15} className="text-primary" />Dados bibliográficos: Open Library</p><a className="mt-2 block text-xs font-semibold text-primary" href={`https://openlibrary.org${book.openLibraryKey ?? `/search?q=${encodeURIComponent(book.title)}`}`} target="_blank" rel="noreferrer">Ver registro bibliográfico ↗</a></div>
        <InventoryCard book={book} />
      </div></div></section>

      <section className="bg-canvas py-14 md:py-20"><div className="container-page grid gap-10 md:grid-cols-[1.2fr_.8fr]"><div><p className="eyebrow">Sobre a obra</p><h2 className="section-title mt-3">Uma leitura entre as linhas.</h2><p className="mt-5 text-sm leading-[1.65] text-muted">{book.description ?? `Conheça ${book.title}, de ${book.author}, e consulte seus dados bibliográficos na Open Library.`}</p><div className="mt-5 flex flex-wrap gap-2">{(book.subjects?.slice(0, 3) ?? ['Literatura']).map((tag) => <span key={tag} className="rounded-full border border-line bg-surface px-3 py-1.5 text-[10px] text-muted">{tag}</span>)}</div></div><PublicationInfo book={book} /></div></section>

      <section className="py-7"><div className="container-page"><div className="flex gap-3 rounded-[10px] bg-primary-soft p-5"><ShieldCheck size={18} className="shrink-0 text-primary" /><div><strong className="block text-xs">A disponibilidade é da biblioteca universitária</strong><p className="mt-1 text-[10px] leading-relaxed text-muted">Os dados da Open Library não representam estoque físico. Confirme prazos, condições de retirada e a edição do exemplar ao solicitar.</p></div></div></div></section>

      <section className="py-14 md:py-20"><div className="container-page"><div className="flex items-end justify-between"><div><p className="eyebrow">Continue explorando</p><h2 className="section-title mt-3">Outras obras do catálogo.</h2></div><Link to="/catalogo" className="text-xs font-semibold text-primary">Ver catálogo →</Link></div>{related.isLoading ? <p className="mt-8 text-sm text-muted">Consultando a Open Library…</p> : <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{related.data?.books.map((item) => <BookCard key={item.id} book={item} dense />)}</div>}</div></section>
    </>
  )
}

function InventoryCard({ book }: { book: Book }) { return <aside className="card p-6 shadow-card"><h2 className="flex items-center gap-2 text-sm font-semibold"><Library size={17} className="text-primary" />Acervo da universidade</h2><div className="mt-5"><StatusPill status={book.availability} count={0} long /></div><div className="mt-5 flex items-end gap-2"><strong className="text-4xl font-semibold">0</strong><span className="pb-1 text-xs text-subtle">cópias confirmadas</span></div><p className="mt-5 text-xs leading-relaxed text-muted">Não há tabela de acervo interno configurada no Supabase. Este livro permanece somente como registro bibliográfico e não pode ser solicitado.</p></aside> }
function PublicationInfo({ book }: { book: Book }) { const rows=[['Autor',book.author],['Primeira publicação',String(book.year ?? 'Não informada')],['Idioma da obra',book.language],['Gênero',book.category],['Fonte bibliográfica','Open Library']]; return <div><h3 className="text-lg font-semibold">Informações de publicação</h3><dl className="mt-4">{rows.map(([k,v]) => <div key={k} className="grid grid-cols-2 border-b border-line py-3 text-xs"><dt className="text-subtle">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl><p className="mt-5 text-[10px] leading-relaxed text-subtle">Estes dados descrevem a obra. Editora, ano da edição e ISBN podem variar entre os exemplares físicos.</p></div> }
function DetailState({ title, retry }: { title: string; retry?: () => void }) { return <section className="container-page py-24 text-center"><h1 className="text-2xl font-semibold">{title}</h1>{retry && <button onClick={retry} className="btn-primary mt-6"><RefreshCw size={17} />Tentar novamente</button>}</section> }
