import { render, screen } from '@testing-library/react'
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
