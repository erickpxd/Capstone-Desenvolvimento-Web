import { ArrowRight, Search } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SearchBar({ compact = false, initialValue = '' }: { compact?: boolean; initialValue?: string }) {
  const [query, setQuery] = useState(initialValue)
  const navigate = useNavigate()

  function submit(event: FormEvent) {
    event.preventDefault()
    navigate(`/catalogo${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }

  return (
    <form onSubmit={submit} className={`flex w-full items-center rounded-[10px] border border-line bg-white p-1 shadow-sm ${compact ? 'h-12' : 'h-14'}`} role="search">
      <Search size={18} className="ml-2.5 shrink-0 text-slate-500" aria-hidden="true" />
      <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-500" placeholder="Busque por título, autor ou assunto" aria-label="Pesquisar livros" />
      <button className="hidden h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-blue-700 md:block" type="submit">Buscar livros</button>
      <button className="flex size-9 items-center justify-center rounded-lg bg-primary text-white md:hidden" type="submit" aria-label="Pesquisar"><ArrowRight size={17} /></button>
    </form>
  )
}
