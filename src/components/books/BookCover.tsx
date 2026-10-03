import type { Book } from '../../types/book'

const art: Partial<Record<Book['cover'], [string, string]>> = {
  dom: ['/assets/dom-ring.svg', '/assets/dom-inner.svg'],
  quarto: ['/assets/quarto-ring.svg', '/assets/quarto-inner.svg'],
  hora: ['/assets/hora-ring.svg', '/assets/hora-inner.svg'],
  capitaes: ['/assets/capitaes-ring.svg', '/assets/capitaes-inner.svg'],
  design: ['/assets/design-ring.svg', '/assets/design-inner.svg'],
}

export function BookCover({ book, large = false }: { book: Book; large?: boolean }) {
  const images = art[book.cover]
  const dimensions = large ? 'h-[290px] w-[200px]' : 'h-[182px] w-[126px]'

  if (book.coverImageUrl) {
    return <img src={book.coverImageUrl} alt={`Capa de ${book.title}`} className={`${dimensions} shrink-0 rounded-[3px] object-cover shadow-book`} loading="lazy" />
  }

  return (
    <div
      className={`relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[3px] p-[10%] shadow-book ${dimensions}`}
      style={{ backgroundColor: book.coverColor, color: book.coverInk }}
      aria-label={`Capa ilustrativa de ${book.title}`}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-black/10" />
      <span className="text-[7px] font-medium uppercase leading-tight">{book.eyebrow}</span>
      <span className="relative flex h-[32%] items-center justify-center" aria-hidden="true">
        {images ? <><img src={images[0]} alt="" className="absolute size-[75%]" /><img src={images[1]} alt="" className="absolute size-[55%]" /></> : <Bars type={book.cover} />}
      </span>
      <strong className={`${large ? 'text-[27px]' : 'text-[18px]'} font-semibold leading-[1.05]`}>{book.title}</strong>
      <span className="text-[5px] uppercase">{book.category}</span>
    </div>
  )
}

function Bars({ type }: { type: Book['cover'] }) {
  if (type === 'codigo') return <div className="flex h-12 items-start gap-2">{[36, 48, 40, 26].map((h, i) => <i key={i} className="block w-2 bg-current" style={{ height: h }} />)}</div>
  return <div className="flex h-12 items-start gap-2">{[30, 45, 38, 48].map((h, i) => <i key={i} className="block w-2 bg-current" style={{ height: h }} />)}</div>
}
