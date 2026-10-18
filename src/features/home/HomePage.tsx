import { useQuery } from '@tanstack/react-query'
import { BookOpen, CodeXml, FlaskConical, GraduationCap, Landmark, PenTool, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BookCard } from '../../components/books/BookCard'
import { BookCover } from '../../components/books/BookCover'
import { SearchBar } from '../../components/ui/SearchBar'
import { StatusPill } from '../../components/ui/StatusPill'
import { getInventories } from '../../services/library'
import { searchOpenLibraryBooks } from '../../services/openLibrary'
import type { Book } from '../../types/book'

const categories = [
  ['Literatura', BookOpen], ['Tecnologia', CodeXml], ['Educação', GraduationCap],
  ['Ciências', FlaskConical], ['História', Landmark], ['Design', PenTool],
] as const

export function HomePage() {
  const discovery = useQuery({ queryKey: ['open-library', 'home'], queryFn: ({ signal }) => searchOpenLibraryBooks({ query: 'literatura brasileira', language: 'por', pageSize: 8, signal }) })
  const inventories=useQuery({queryKey:['library','home-inventories',discovery.data?.books.map((book)=>book.openLibraryKey)],queryFn:()=>getInventories(discovery.data?.books.flatMap((book)=>book.openLibraryKey?[book.openLibraryKey]:[])??[]),enabled:Boolean(discovery.data?.books.length),retry:false})
  const liveBooks = (discovery.data?.books ?? []).map((book)=>{const item=book.openLibraryKey?inventories.data?.[book.openLibraryKey]:undefined;return item?{...book,totalCopies:item.totalCopies,availableCopies:item.availableCopies,availability:item.availableCopies>0?'available' as const:'borrowed' as const}:book})
  return (
    <>
      <section className="bg-surface py-8 md:py-16">
        <div className="container-page grid items-center gap-7 md:grid-cols-[1.08fr_.92fr] md:gap-12">
          <div>
            <p className="eyebrow mb-5 inline-flex items-center gap-2"><Sparkles size={14} />Aberto a novas descobertas</p>
            <h1 className="max-w-xl text-[40px] font-normal leading-[1.02] md:text-[64px]">Seu próximo capítulo começa aqui.</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">Explore ideias, encontre sua próxima leitura e conecte-se ao acervo da sua universidade.</p>
            <div className="mt-7 max-w-2xl"><SearchBar /></div>
            <p className="mt-3 text-[11px] text-subtle"><Search size={12} className="mr-1 inline" />Experimente: Machado de Assis, educação ou design</p>
          </div>
          <FeaturedHero book={liveBooks[0]} loading={discovery.isLoading} />
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Curadoria da biblioteca" title="Uma boa leitura muda tudo." action="Ver catálogo" />
          <p className="mt-3 text-sm text-muted">Clássicos e novas perspectivas para a sua próxima descoberta.</p>
          {discovery.isLoading ? <p role="status" className="mt-8 text-sm text-muted">Consultando a Open Library…</p> : discovery.isError ? <p role="alert" className="mt-8 text-sm text-red-700">Não foi possível consultar a Open Library agora.</p> : <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{liveBooks.slice(0, 4).map((b) => <BookCard key={b.id} book={b} dense />)}</div>}
        </div>
      </section>

      <section className="bg-canvas py-14 md:py-20">
        <div className="container-page">
          <p className="eyebrow">Siga sua curiosidade</p><h2 className="section-title mt-3">Por onde você quer começar?</h2>
          <p className="mt-3 text-sm text-muted">Encontre leituras que conversam com a sua área — ou descubra uma nova.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">{categories.map(([name, Icon]) => <Link key={name} to={`/catalogo?q=${name}`} className="card p-4 hover:border-primary"><Icon size={20} className="text-primary" /><strong className="mt-4 block text-sm font-medium">{name}</strong><span className="mt-2 block text-[11px] text-subtle">Explorar →</span></Link>)}</div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-page grid items-center gap-9 md:grid-cols-2 md:gap-20">
          <div className="flex min-h-72 items-end justify-center gap-4 rounded-2xl bg-stage p-8">{liveBooks.slice(4, 6).map((book) => <BookCover key={book.id} book={book} />)}{!discovery.isLoading && liveBooks.length < 5 && <span className="self-center text-sm text-muted">Capas indisponíveis</span>}</div>
          <div><p className="eyebrow">Um encontro com nossas histórias</p><h2 className="section-title mt-3">Vozes brasileiras. Horizontes sem fim.</h2><p className="mt-5 text-sm leading-relaxed text-muted">De Machado a Carolina, descubra narrativas que atravessam o tempo e ampliam a forma de olhar o mundo.</p><Link className="btn-outline mt-7" to="/catalogo?q=Literatura brasileira">Explorar literatura brasileira</Link></div>
        </div>
      </section>

      <section id="como-funciona" className="bg-canvas py-14 md:py-20">
        <div className="container-page"><p className="eyebrow">Simples, do início ao fim</p><h2 className="section-title mt-3">Da descoberta à sua próxima leitura.</h2><div className="mt-8 grid gap-4 md:grid-cols-3"><Step n="01" title="Encontre sua leitura" text="Pesquise por título, autor ou assunto." /><Step n="02" title="Confira a disponibilidade" text="Veja quantos exemplares estão disponíveis na biblioteca." /><Step n="03" title="Solicite ou reserve" text="Peça um empréstimo ou entre na fila de reserva." /></div></div>
      </section>
    </>
  )
}

function FeaturedHero({ book, loading }: { book?: Book; loading: boolean }) { return <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-slate-900 md:min-h-[460px]"><img src="/assets/library-hero.png" alt="Interior de uma biblioteca universitária" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/10" /><div className="absolute inset-x-5 bottom-5 flex items-end gap-4">{book && <BookCover book={book} />}<div className="pb-2 text-white"><span className="text-[9px] uppercase">Open Library</span><h2 className="mt-2 text-2xl font-semibold">{loading ? 'Consultando catálogo…' : book?.title ?? 'Catálogo público'}</h2><p className="mt-1 text-xs text-slate-200">{book?.author ?? 'Descubra sua próxima leitura'}</p>{book && <><div className="mt-3"><StatusPill status={book.availability} count={book.availableCopies} /></div><Link to={`/livros/${book.id}`} className="mt-4 block text-xs font-semibold">Conhecer o livro →</Link></>}</div></div></div> }
function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) { return <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">{eyebrow}</p><h2 className="section-title mt-3">{title}</h2></div><Link className="shrink-0 text-xs font-semibold text-primary" to="/catalogo">{action} →</Link></div> }
function Step({ n, title, text }: { n: string; title: string; text: string }) { return <div className="card p-6"><span className="text-sm font-semibold text-primary">{n}</span><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-3 text-xs leading-relaxed text-muted">{text}</p></div> }
