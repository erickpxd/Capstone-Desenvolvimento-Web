import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronLeft, ChevronRight, Info, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookCard } from '../../components/books/BookCard'
import { SearchBar } from '../../components/ui/SearchBar'
import { searchOpenLibraryBooks } from '../../services/openLibrary'
import type { Availability } from '../../types/book'

const genres = ['Todos os gêneros', 'Literatura brasileira', 'Educação', 'Tecnologia', 'Ciências', 'História', 'Design']
const pageSize = 8

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const [genre, setGenre] = useState(query && genres.includes(query) ? query : 'Todos os gêneros')
  const [availability, setAvailability] = useState<Availability | 'all'>('all')
  const [language, setLanguage] = useState('')
  const [sort, setSort] = useState<'relevance' | 'new' | 'old'>('relevance')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const catalog = useQuery({
    queryKey: ['open-library', 'search', query, genre, language, page, sort],
    queryFn: ({ signal }) => searchOpenLibraryBooks({ query, genre: genre === 'Todos os gêneros' ? '' : genre, language, page, pageSize, sort, signal }),
    placeholderData: (previous) => previous,
  })

  const visibleBooks = useMemo(() => {
    const result = catalog.data?.books ?? []
    return availability === 'all' ? result : result.filter((book) => book.availability === availability)
  }, [availability, catalog.data?.books])
  const totalPages = Math.max(1, Math.ceil((catalog.data?.total ?? 0) / pageSize))

  function changePage(next: number) {
    const updated = new URLSearchParams(params)
    if (next <= 1) updated.delete('page'); else updated.set('page', String(next))
    setParams(updated)
    window.scrollTo({ top: 280, behavior: 'smooth' })
  }
  function clearFilters() { setGenre('Todos os gêneros'); setAvailability('all'); setLanguage(''); changePage(1) }

  return (
    <>
      <section className="border-b border-line py-9 md:py-14"><div className="container-page"><p className="text-xs text-subtle">Início / Catálogo</p><span className="mt-5 inline-flex rounded-full bg-primary-soft px-3 py-1.5 text-[11px] font-semibold text-primary">Catálogo público · sem login</span><h1 className="mt-4 text-[36px] font-normal leading-tight md:text-[46px]">Conhecimento para explorar.</h1><p className="mt-3 text-sm text-muted">Descubra livros na Open Library e confira quais fazem parte do acervo físico da universidade.</p><div className="mt-7"><SearchBar compact initialValue={query} /></div></div></section>
      <section className="bg-canvas py-8 md:py-10"><div className="container-page">
        <div className="mb-6 flex gap-3 md:hidden"><button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-outline h-10 flex-1"><SlidersHorizontal size={16} />Filtros</button><button onClick={clearFilters} className="btn-outline h-10 flex-1">Todos os gêneros</button></div>
        <div className="grid items-start gap-8 md:grid-cols-[208px_1fr]">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} card p-5 md:block`}><FilterPanel genre={genre} setGenre={(value) => { setGenre(value); changePage(1) }} availability={availability} setAvailability={setAvailability} language={language} setLanguage={(value) => { setLanguage(value); changePage(1) }} clear={clearFilters} /></aside>
          <div>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><h2 className="text-lg font-semibold">Explore o catálogo</h2><p className="mt-1 text-xs text-subtle">{catalog.isLoading ? 'Consultando a Open Library…' : `Exibindo ${visibleBooks.length} de ${(catalog.data?.total ?? 0).toLocaleString('pt-BR')} resultados`}</p></div><label className="relative"><select value={sort} onChange={(event) => { setSort(event.target.value as typeof sort); changePage(1) }} className="h-10 min-w-[220px] appearance-none rounded-lg border border-line bg-surface px-4 pr-9 text-xs text-muted"><option value="relevance">Ordenar por: Relevância</option><option value="new">Mais recentes</option><option value="old">Mais antigos</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3 text-subtle" /></label></div>
            <p className="mt-5 text-[10px] text-subtle">Bibliografia: Open Library <span className="mx-2">·</span> Cópias e situações: universidade</p>
            {catalog.isLoading ? <CatalogSkeleton /> : catalog.isError ? <ErrorState retry={() => catalog.refetch()} /> : visibleBooks.length ? <div className={`mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5 ${catalog.isFetching ? 'opacity-60' : ''}`}>{visibleBooks.map((book) => <BookCard key={book.id} book={book} dense />)}</div> : <div className="card mt-6 p-10 text-center"><p className="font-semibold">Nenhum livro encontrado</p><p className="mt-2 text-sm text-muted">Tente limpar os filtros ou buscar por outro termo.</p></div>}
            {!catalog.isError && <><div className="mt-9 flex items-center justify-center gap-2 text-xs"><button disabled={page === 1} onClick={() => changePage(page - 1)} aria-label="Página anterior" className="p-2 disabled:opacity-30"><ChevronLeft size={17} /></button>{pageNumbers(page, totalPages).map((number) => <button key={number} onClick={() => changePage(number)} className={`size-9 rounded-lg ${number === page ? 'bg-primary text-white' : 'border border-line bg-surface'}`}>{number}</button>)}<button disabled={page >= totalPages} onClick={() => changePage(page + 1)} aria-label="Próxima página" className="p-2 text-primary disabled:opacity-30"><ChevronRight size={17} /></button></div><p className="mt-4 text-center text-[10px] text-subtle">Página {page} de {totalPages.toLocaleString('pt-BR')}</p></>}
            <div className="mt-8 flex gap-3 rounded-[10px] bg-primary-soft p-5"><Info size={18} className="shrink-0 text-primary" /><div><strong className="block text-xs">Encontrar um livro não garante empréstimo físico</strong><p className="mt-1 text-[10px] leading-relaxed text-muted">Livros marcados como “Somente no catálogo” não possuem exemplares na universidade. Consulte os detalhes de cada obra.</p></div></div>
          </div>
        </div>
      </div></section>
    </>
  )
}

function FilterPanel({ genre, setGenre, availability, setAvailability, language, setLanguage, clear }: { genre: string; setGenre: (v: string) => void; availability: Availability | 'all'; setAvailability: (v: Availability | 'all') => void; language: string; setLanguage: (v: string) => void; clear: () => void }) {
  return <><div className="flex justify-between"><strong className="text-sm">Filtros</strong><button onClick={clear} className="text-[11px] text-primary">Limpar</button></div><FilterGroup label="Gênero">{genres.map((g) => <Radio key={g} checked={genre === g} onChange={() => setGenre(g)} label={g} />)}</FilterGroup><div className="my-5 border-t border-line" /><FilterGroup label="Acervo da universidade"><Radio checked={availability === 'all'} onChange={() => setAvailability('all')} label="Todas as situações" /><Radio checked={availability === 'available'} onChange={() => setAvailability('available')} label="Cópias disponíveis" /><Radio checked={availability === 'borrowed'} onChange={() => setAvailability('borrowed')} label="Todos emprestados" /><Radio checked={availability === 'catalog-only'} onChange={() => setAvailability('catalog-only')} label="Somente no catálogo" /></FilterGroup><FilterGroup label="Idioma"><Radio checked={language === ''} onChange={() => setLanguage('')} label="Todos" /><Radio checked={language === 'por'} onChange={() => setLanguage('por')} label="Português" /><Radio checked={language === 'eng'} onChange={() => setLanguage('eng')} label="Inglês" /><Radio checked={language === 'spa'} onChange={() => setLanguage('spa')} label="Espanhol" /></FilterGroup><p className="mt-6 text-[10px] leading-relaxed text-subtle">A disponibilidade física é informada pela universidade, não pela Open Library.</p></>
}
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) { return <fieldset className="mt-5 space-y-3"><legend className="mb-3 text-xs font-semibold">{label}</legend>{children}</fieldset> }
function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) { return <label className={`flex cursor-pointer items-center gap-2 text-xs ${checked ? 'text-primary' : 'text-muted'}`}><input type="radio" checked={checked} onChange={onChange} className="accent-primary" />{label}</label> }
function CatalogSkeleton() { return <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5" aria-label="Carregando livros">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-[390px] animate-pulse rounded-[14px] border border-line bg-surface"><div className="m-5 h-[182px] rounded bg-line" /><div className="m-4 space-y-3"><div className="h-3 w-2/3 rounded bg-line" /><div className="h-4 rounded bg-line" /><div className="h-3 w-1/2 rounded bg-line" /></div></div>)}</div> }
function ErrorState({ retry }: { retry: () => void }) { return <div className="card mt-6 p-10 text-center" role="alert"><p className="font-semibold">Catálogo temporariamente indisponível</p><p className="mt-2 text-sm text-muted">Não foi possível consultar a Open Library agora.</p><button onClick={retry} className="btn-primary mt-5"><RefreshCw size={17} />Tentar novamente</button></div> }
function pageNumbers(page: number, total: number) { const start = Math.max(1, Math.min(page - 1, total - 2)); return Array.from({ length: Math.min(3, total) }, (_, index) => start + index) }
