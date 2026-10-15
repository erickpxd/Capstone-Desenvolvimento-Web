import { useState } from 'react'
import type { Book } from '../../types/book'

const art: Partial<Record<Book['cover'], [string, string]>> = {
  dom: ['/assets/dom-ring.svg', '/assets/dom-inner.svg'],
  quarto: ['/assets/quarto-ring.svg', '/assets/quarto-inner.svg'],
  hora: ['/assets/hora-ring.svg', '/assets/hora-inner.svg'],
  capitaes: ['/assets/capitaes-ring.svg', '/assets/capitaes-inner.svg'],
  design: ['/assets/design-ring.svg', '/assets/design-inner.svg'],
}

export function BookCover({ book, large = false }: { book: Book; large?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const images = art[book.cover]
  const dimensions = large ? 'h-[290px] w-[200px]' : 'h-[182px] w-[126px]'
  const padding = large ? 'p-5' : 'p-3'
  const titleLength = book.title.trim().length
  const titleSize = large
    ? titleLength > 55 ? 'text-[17px]' : titleLength > 34 ? 'text-[21px]' : 'text-[27px]'
    : titleLength > 45 ? 'text-[11px]' : titleLength > 30 ? 'text-[14px]' : 'text-[18px]'
  const titleHeight = large ? 'max-h-[142px]' : titleLength > 45 ? 'max-h-[58px]' : 'max-h-[76px]'

  if (book.coverImageUrl && failedUrl !== book.coverImageUrl) {
    return <img src={book.coverImageUrl} alt={`Capa de ${book.title}`} className={`${dimensions} shrink-0 rounded-[3px] object-cover shadow-book`} loading="lazy" onError={() => setFailedUrl(book.coverImageUrl!)} />
  }

  return (
    <div
      className={`relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[3px] shadow-book ${dimensions} ${padding}`}
      style={{ backgroundColor: book.coverColor, color: book.coverInk }}
      aria-label={`Capa ilustrativa de ${book.title}`}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-black/10" />
      <span className="text-[7px] font-medium uppercase leading-tight">{book.eyebrow}</span>
      <span className="relative flex h-[32%] items-center justify-center" aria-hidden="true">
        {images ? <><img src={images[0]} alt="" className="absolute size-[75%]" /><img src={images[1]} alt="" className="absolute size-[55%]" /></> : <Bars type={book.cover} />}
      </span>
      <strong
        className={`${titleSize} ${titleHeight} block w-full shrink-0 overflow-hidden break-words font-semibold leading-[1.05]`}
        title={book.title}
      >
        {book.title}
      </strong>
      <span className="text-[5px] uppercase">{book.category}</span>
    </div>
  )
}

function Bars({ type }: { type: Book['cover'] }) {
  if (type === 'codigo') return <div className="flex h-12 items-start gap-2">{[36, 48, 40, 26].map((h, i) => <i key={i} className="block w-2 bg-current" style={{ height: h }} />)}</div>
  return <div className="flex h-12 items-start gap-2">{[30, 45, 38, 48].map((h, i) => <i key={i} className="block w-2 bg-current" style={{ height: h }} />)}</div>
}
