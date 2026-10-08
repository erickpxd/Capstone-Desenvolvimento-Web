import { Link } from 'react-router-dom'
import type { Book } from '../../types/book'
import { StatusPill } from '../ui/StatusPill'
import { BookCover } from './BookCover'

export function BookCard({ book, dense = false }: { book: Book; dense?: boolean }) {
  return (
    <Link to={`/livros/${book.id}`} className="group overflow-hidden rounded-[14px] border border-line bg-surface shadow-card transition-transform hover:-translate-y-0.5">
      <div className={`flex items-center justify-center bg-canvas ${dense ? 'p-4' : 'p-5 md:p-6'}`}><BookCover book={book} /></div>
      <div className={`${dense ? 'p-3' : 'p-4'} space-y-2`}>
        <p className="text-[10px] text-subtle">{book.category}</p>
        <h3 className="min-h-[40px] text-sm font-medium leading-snug group-hover:text-primary">{book.title}</h3>
        <p className="text-xs text-muted">{book.author}</p>
        <StatusPill status={book.availability} count={book.availableCopies} />
        <p className="text-[9px] text-subtle">{book.totalCopies ? `${book.totalCopies} cópias na universidade` : 'Sem cópia na universidade'}</p>
      </div>
    </Link>
  )
}
