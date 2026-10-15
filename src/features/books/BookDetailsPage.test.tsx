import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { getOpenLibraryWork, searchOpenLibraryBooks } from '../../services/openLibrary'
import type { Book } from '../../types/book'
import { BookDetailsPage } from './BookDetailsPage'

jest.mock('../../services/openLibrary', () => ({ getOpenLibraryWork: jest.fn(), searchOpenLibraryBooks: jest.fn() }))
const mockedWork = jest.mocked(getOpenLibraryWork)
const mockedSearch = jest.mocked(searchOpenLibraryBooks)
const book: Book = { id: 'OL1W', openLibraryKey: '/works/OL1W', title: 'Dom Casmurro', author: 'Machado de Assis', eyebrow: 'MACHADO DE ASSIS', category: 'Literatura', language: 'Português', year: 1899, availability: 'catalog-only', availableCopies: 0, totalCopies: 0, cover: 'generic', coverColor: '#DCE5EC', coverInk: '#243541' }

function renderDetails() {
  mockedWork.mockResolvedValue(book)
  mockedSearch.mockResolvedValue({ books: [], total: 0, page: 1, pageSize: 4 })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/livros/OL1W']}><Routes><Route path="/livros/:bookId" element={<BookDetailsPage />} /></Routes></MemoryRouter></QueryClientProvider>)
}

test('consulta os detalhes na Open Library sem inventar exemplares', async () => {
  const { container } = renderDetails()
  expect(await screen.findByRole('heading', { level: 1, name: 'Dom Casmurro' })).toBeInTheDocument()
  expect(container).toHaveTextContent('0cópias confirmadas')
  expect(screen.getByText(/não há tabela de acervo interno/i)).toBeInTheDocument()
  expect(mockedWork).toHaveBeenCalled()
  expect(screen.queryByRole('button', { name: /solicitar empréstimo/i })).not.toBeInTheDocument()
})

test('mostra erro quando a obra não existe na Open Library', async () => {
  mockedWork.mockRejectedValue(new Error('não encontrado'))
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/livros/inexistente']}><Routes><Route path="/livros/:bookId" element={<BookDetailsPage />} /></Routes></MemoryRouter></QueryClientProvider>)
  expect(await screen.findByRole('heading', { name: /não foi possível carregar/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
})
