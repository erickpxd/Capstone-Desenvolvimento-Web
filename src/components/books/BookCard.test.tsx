import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Book } from '../../types/book'
import { BookCard } from './BookCard'

const book: Book = {
  id: 'dom-casmurro',
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  eyebrow: 'MACHADO DE ASSIS',
  category: 'Literatura brasileira',
  language: 'Português',
  availability: 'available',
  availableCopies: 3,
  totalCopies: 5,
  cover: 'generic',
  coverColor: '#fff',
  coverInk: '#000',
}

test('exibe os dados críticos do livro e aponta para os detalhes', () => {
  render(<MemoryRouter><BookCard book={book} /></MemoryRouter>)

  expect(screen.getByRole('heading', { name: book.title })).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(/3.*disponíveis/i)).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', '/livros/dom-casmurro')
})

test('informa quando não existe cópia física', () => {
  render(<MemoryRouter><BookCard book={{ ...book, availability: 'catalog-only', availableCopies: 0, totalCopies: 0 }} /></MemoryRouter>)
  expect(screen.getByText('Sem cópia na universidade')).toBeInTheDocument()
})

test('substitui uma imagem externa quebrada pela capa visual do sistema', () => {
  render(<MemoryRouter><BookCard book={{ ...book, coverImageUrl: 'https://covers.openlibrary.org/quebrada.jpg' }} /></MemoryRouter>)
  fireEvent.error(screen.getByRole('img', { name: `Capa de ${book.title}` }))
  expect(screen.queryByRole('img', { name: `Capa de ${book.title}` })).not.toBeInTheDocument()
  expect(screen.getByLabelText(`Capa ilustrativa de ${book.title}`)).toBeInTheDocument()
})

test('mantém títulos longos dentro da capa ilustrativa', () => {
  const longTitle = 'Pequena bibliografia crítica da literatura brasileira'
  render(<MemoryRouter><BookCard book={{ ...book, title: longTitle }} /></MemoryRouter>)

  const cover = screen.getByLabelText(`Capa ilustrativa de ${longTitle}`)
  const title = cover.querySelector('strong')

  expect(title).toHaveClass('overflow-hidden', 'break-words', 'text-[11px]', 'max-h-[58px]')
  expect(title).toHaveAttribute('title', longTitle)
  expect(cover).toHaveClass('w-[126px]', 'p-3')
})
