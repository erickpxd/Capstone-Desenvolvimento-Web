import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { getOpenLibraryWork, searchOpenLibraryBooks } from '../../services/openLibrary'
import { borrowBook, getInventory, getSavedState, reserveBook, setReadingStatus, setWishlist } from '../../services/library'
import type { Book } from '../../types/book'
import { BookDetailsPage } from './BookDetailsPage'
import { useAuth } from '../auth/AuthContext'
import userEvent from '@testing-library/user-event'

jest.mock('../../services/openLibrary', () => ({ getOpenLibraryWork: jest.fn(), searchOpenLibraryBooks: jest.fn() }))
jest.mock('../../services/library', () => ({
  getInventory: jest.fn().mockRejectedValue(new (jest.requireActual('../../types/library').LibrarySchemaUnavailableError)()),
  getSavedState: jest.fn(), borrowBook: jest.fn(), reserveBook: jest.fn(), setReadingStatus: jest.fn(), setWishlist: jest.fn(),
}))
jest.mock('../auth/AuthContext', () => ({ useAuth: jest.fn() }))
const mockedAuth=jest.mocked(useAuth)
const mockedWork = jest.mocked(getOpenLibraryWork)
const mockedSearch = jest.mocked(searchOpenLibraryBooks)
const book: Book = { id: 'OL1W', openLibraryKey: '/works/OL1W', title: 'Dom Casmurro', author: 'Machado de Assis', eyebrow: 'MACHADO DE ASSIS', category: 'Literatura', language: 'Português', year: 1899, availability: 'catalog-only', availableCopies: 0, totalCopies: 0, cover: 'generic', coverColor: '#DCE5EC', coverInk: '#243541' }

beforeEach(()=>mockedAuth.mockReturnValue({user:null} as never))

function renderDetails() {
  mockedWork.mockResolvedValue(book)
  mockedSearch.mockResolvedValue({ books: [], total: 0, page: 1, pageSize: 4 })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/livros/OL1W']}><Routes><Route path="/livros/:bookId" element={<BookDetailsPage />} /></Routes></MemoryRouter></QueryClientProvider>)
}

test('consulta os detalhes na Open Library sem inventar exemplares', async () => {
  const { container } = renderDetails()
  expect(await screen.findByRole('heading', { level: 1, name: 'Dom Casmurro' })).toBeInTheDocument()
  expect(await screen.findByText(/disponibilidade não pôde ser consultada/i)).toBeInTheDocument()
  expect(container).toHaveTextContent('0cópias confirmadas')
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

test('permite empréstimo e estados pessoais quando autenticado', async () => {
  mockedAuth.mockReturnValue({user:{id:'u1'}} as never); jest.mocked(getInventory).mockResolvedValue({bookId:'b1',totalCopies:2,availableCopies:1}); jest.mocked(getSavedState).mockResolvedValue({readingStatus:undefined,wished:false})
  const user=userEvent.setup(); renderDetails()
  await user.click(await screen.findByRole('button',{name:'Solicitar empréstimo'})); expect(borrowBook).toHaveBeenCalledWith('b1')
  await user.selectOptions(screen.getByLabelText('Estado de leitura'),'reading'); expect(setReadingStatus).toHaveBeenCalledWith(expect.objectContaining({id:'OL1W'}),'reading')
  await user.click(screen.getByRole('button',{name:'Adicionar aos desejos'})); expect(setWishlist).toHaveBeenCalledWith(expect.objectContaining({id:'OL1W'}),true)
})

test('oferece reserva quando todos os exemplares estão emprestados', async () => {
  mockedAuth.mockReturnValue({user:{id:'u1'}} as never); jest.mocked(getInventory).mockResolvedValue({bookId:'b1',totalCopies:1,availableCopies:0}); jest.mocked(getSavedState).mockResolvedValue({readingStatus:'completed',wished:true})
  const user=userEvent.setup(); renderDetails(); await user.click(await screen.findByRole('button',{name:'Reservar livro'})); expect(reserveBook).toHaveBeenCalledWith('b1')
})
