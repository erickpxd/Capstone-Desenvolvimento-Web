import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Biblioteca Online — início">
      <span className={`${compact ? 'size-8 rounded-lg' : 'size-9 rounded-[10px]'} flex items-center justify-center bg-primary text-white`}>
        <BookOpen size={compact ? 17 : 20} strokeWidth={2} />
      </span>
      <span className="leading-none">
        <strong className={`${compact ? 'text-sm' : 'text-base'} block font-semibold`}>Biblioteca Online</strong>
        <span className="mt-1 block text-[8px] uppercase tracking-wide text-slate-500">Biblioteca universitária</span>
      </span>
    </Link>
  )
}
