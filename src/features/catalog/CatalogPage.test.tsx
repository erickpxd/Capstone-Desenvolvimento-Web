import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { searchOpenLibraryBooks } from '../../services/openLibrary'
import type { Book } from '../../types/book'
import { CatalogPage } from './CatalogPage'

jest.mock('../../services/openLibrary', () => ({ searchOpenLibraryBooks: jest.fn() }))
const mockedSearch = jest.mocked(searchOpenLibraryBooks)

const available: Book = { id: '1', title: 'Livro disponível', author: 'Autora', eyebrow: 'AUTORA', category: 'Educação', language: 'Português', availability: 'available', availableCopies: 2, totalCopies: 2, cover: 'generic', coverColor: '#fff', coverInk: '#000' }
const borrowed: Book = { ...available, id: '2', title: 'Livro emprestado', availability: 'borrowed', availableCopies: 0 }

function renderCatalog() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/catalogo?q=educacao']}><Routes><Route path="/catalogo" element={<CatalogPage />} /></Routes></MemoryRouter></QueryClientProvider>)
}

beforeEach(() => {
  mockedSearch.mockReset()
  mockedSearch.mockResolvedValue({ books: [available, borrowed], total: 2, page: 1, pageSize: 8 })
})

test('carrega catálogo, filtra disponibilidade e altera ordenação', async () => {
  const user = userEvent.setup()
  renderCatalog()
  expect(await screen.findByRole('heading', { name: 'Livro disponível' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Livro emprestado' })).toBeInTheDocument()

  await user.click(screen.getByLabelText('Todos emprestados'))
  expect(screen.queryByRole('heading', { name: 'Livro disponível' })).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Livro emprestado' })).toBeInTheDocument()

  await user.selectOptions(screen.getByRole('combobox'), 'new')
  expect(await screen.findByRole('heading', { name: 'Livro emprestado' })).toBeInTheDocument()
  expect(mockedSearch).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'new' }))
})

test('mostra estado de erro e permite tentar novamente', async () => {
  mockedSearch.mockRejectedValue(new Error('offline'))
  const user = userEvent.setup()
  renderCatalog()
  expect(await screen.findByRole('alert')).toHaveTextContent('Catálogo temporariamente indisponível')
  await user.click(screen.getByRole('button', { name: /tentar novamente/i }))
  expect(mockedSearch).toHaveBeenCalledTimes(2)
})
