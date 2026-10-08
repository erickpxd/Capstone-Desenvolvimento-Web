import type { Availability } from '../../types/book'

const copy: Record<Availability, (n: number) => string> = {
  available: (n) => `${n} ${n === 1 ? 'disponível' : 'disponíveis'}`,
  borrowed: () => 'Emprestados',
  'catalog-only': () => 'Só no catálogo',
}

export function StatusPill({ status, count = 0, long = false }: { status: Availability; count?: number; long?: boolean }) {
  const styles = status === 'available'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'borrowed'
      ? 'bg-amber-50 text-amber-800'
      : 'bg-canvas text-muted'
  const label = long && status === 'borrowed' ? 'Todos os exemplares emprestados' : copy[status](count)

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${styles}`}>
      <span className="size-1.5 rounded-full bg-current" />{label}
    </span>
  )
}
