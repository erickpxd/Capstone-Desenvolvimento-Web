import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Book } from '../../types/book'
import { BookCover } from '../books/BookCover'
import { Logo } from './Logo'
import { StatusPill } from './StatusPill'

const book: Book = { id: '1', title: 'Código limpo', author: 'Autor', eyebrow: 'AUTOR', category: 'Tecnologia', language: 'Português', availability: 'available', availableCopies: 1, totalCopies: 1, cover: 'codigo', coverColor: '#fff', coverInk: '#000' }

test('renderiza capa remota e as duas variantes de capa gerada', () => {
  const { rerender } = render(<BookCover book={{ ...book, coverImageUrl: 'https://example.com/cover.jpg' }} />)
  expect(screen.getByRole('img', { name: 'Capa de Código limpo' })).toHaveAttribute('src', 'https://example.com/cover.jpg')
  rerender(<BookCover book={book} large />)
  expect(screen.getByLabelText('Capa ilustrativa de Código limpo')).toHaveClass('h-[290px]')
  rerender(<BookCover book={{ ...book, cover: 'generic' }} />)
  expect(screen.getByLabelText('Capa ilustrativa de Código limpo')).toBeInTheDocument()
})

test('renderiza todos os estados de disponibilidade e logo compacto', () => {
  render(<MemoryRouter><Logo compact /><StatusPill status="available" count={1} /><StatusPill status="borrowed" long /><StatusPill status="catalog-only" /></MemoryRouter>)
  expect(screen.getByText('1 disponível')).toBeInTheDocument()
  expect(screen.getByText('Todos os exemplares emprestados')).toBeInTheDocument()
  expect(screen.getByText('Só no catálogo')).toBeInTheDocument()
  expect(screen.getByText('Biblioteca Online')).toHaveClass('text-sm')
})
