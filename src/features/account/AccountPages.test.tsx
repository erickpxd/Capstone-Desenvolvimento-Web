import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { cancelReservation, listLoans, listReadingStatuses, listReservations, listWishlist, renewLoan, setReadingStatus, setWishlist } from '../../services/library'
import { searchOpenLibraryBooks } from '../../services/openLibrary'
import { LoansPage, ReadingPage, ReservationsPage, StudentDashboardPage, WishlistPage } from './AccountPages'
import { LibrarySchemaUnavailableError } from '../../types/library'

jest.mock('../auth/AuthContext', () => ({ useAuth: () => ({ displayName: 'João Silva', user: { email: 'joao@example.com' } }) }))
jest.mock('../../services/openLibrary', () => ({ searchOpenLibraryBooks: jest.fn() }))
jest.mock('../../services/library', () => ({
  listLoans: jest.fn().mockResolvedValue([]), listReservations: jest.fn().mockResolvedValue([]),
  listWishlist: jest.fn().mockResolvedValue([]), listReadingStatuses: jest.fn().mockResolvedValue([]),
  renewLoan: jest.fn(), cancelReservation: jest.fn(), setWishlist: jest.fn(), setReadingStatus: jest.fn(),
}))
const mockedSearch = jest.mocked(searchOpenLibraryBooks)
const mockedLoans=jest.mocked(listLoans); const mockedReservations=jest.mocked(listReservations); const mockedWishlist=jest.mocked(listWishlist); const mockedReading=jest.mocked(listReadingStatuses)

function renderPage(Page: () => JSX.Element) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter><Page /></MemoryRouter></QueryClientProvider>)
}

beforeEach(() => { mockedSearch.mockResolvedValue({ books: [], total: 0, page: 1, pageSize: 4 }); mockedLoans.mockResolvedValue([]); mockedReservations.mockResolvedValue([]); mockedWishlist.mockResolvedValue([]); mockedReading.mockResolvedValue([]) })

const pages = [
  ['Olá, João. Que bom ter você aqui.', StudentDashboardPage],
  ['Cada livro, no seu prazo.', LoansPage],
  ['Sua próxima leitura está a caminho.', ReservationsPage],
  ['Guarde o que desperta sua curiosidade.', WishlistPage],
  ['Uma página de cada vez.', ReadingPage],
] as const

test.each(pages)('renderiza a tela do aluno sem registros inventados: %s', (title, Page) => {
  renderPage(Page)
  expect(screen.getByRole('heading', { name: title, level: 1 })).toBeInTheDocument()
  expect(screen.queryByText('Pedagogia da autonomia')).not.toBeInTheDocument()
})

test('usa o usuário autenticado e consulta recomendações na Open Library', async () => {
  const { container } = renderPage(StudentDashboardPage)
  expect(container).toHaveTextContent('joao@example.com')
  expect(await screen.findByText('Sugestões reais do catálogo público.')).toBeInTheDocument()
  expect(mockedSearch).toHaveBeenCalled()
})

test('informa quando a Open Library está indisponível', async () => {
  mockedSearch.mockRejectedValue(new Error('falha externa'))
  renderPage(StudentDashboardPage)
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar sugestões')
})

test('opera empréstimo, reserva, desejo e estado de leitura persistentes', async () => {
  const user=userEvent.setup(); const book={id:'b1',openLibraryKey:'/works/OL1W',title:'Obra',author:'Autora'}
  mockedLoans.mockResolvedValue([{id:'l1',borrowedAt:'2026-01-01',dueAt:'2026-01-10',renewals:0,status:'active',copy:{id:'c1',code:'C-1',book}}])
  const loans=renderPage(LoansPage); await user.click(await screen.findByRole('button',{name:'Renovar'})); expect(jest.mocked(renewLoan).mock.calls[0][0]).toBe('l1'); loans.unmount()
  mockedReservations.mockResolvedValue([{id:'r1',createdAt:'2026-01-01',status:'active',book}]); const reservations=renderPage(ReservationsPage); await user.click(await screen.findByRole('button',{name:'Cancelar reserva'})); expect(jest.mocked(cancelReservation).mock.calls[0][0]).toBe('r1'); reservations.unmount()
  const saved={openLibraryKey:'/works/OL1W',title:'Obra',author:'Autora'}; mockedWishlist.mockResolvedValue([saved]); const wishes=renderPage(WishlistPage); await user.click(await screen.findByRole('button',{name:'Remover'})); expect(setWishlist).toHaveBeenCalledWith(expect.objectContaining({title:'Obra'}),false); wishes.unmount()
  mockedReading.mockResolvedValue([{...saved,status:'reading'}]); renderPage(ReadingPage); await user.click(await screen.findByRole('button',{name:'Remover estado'})); expect(setReadingStatus).toHaveBeenCalledWith(expect.objectContaining({title:'Obra'}),null)
})

test('trata esquema ausente, falha comum e estados encerrados', async () => {
  mockedLoans.mockRejectedValueOnce(new LibrarySchemaUnavailableError()); const missing=renderPage(LoansPage); expect(await screen.findByText(/banco interno indisponível/i)).toBeInTheDocument(); missing.unmount()
  mockedLoans.mockRejectedValueOnce(new Error('falha de consulta')); const failed=renderPage(LoansPage); expect(await screen.findByRole('alert')).toHaveTextContent('falha de consulta'); failed.unmount()
  const book={id:'b1',openLibraryKey:'/works/OL1W',title:'Obra',author:'Autora'}; mockedLoans.mockResolvedValue([{id:'l2',borrowedAt:'2026-01-01',dueAt:'2026-01-10',returnedAt:'2026-01-09',renewals:1,status:'returned',copy:{id:'c1',code:'C-1',book}}]); const returned=renderPage(LoansPage); expect(await screen.findByText(/devolvido em/i)).toBeInTheDocument(); expect(screen.queryByRole('button',{name:'Renovar'})).not.toBeInTheDocument(); returned.unmount()
  mockedReservations.mockResolvedValue([{id:'r2',createdAt:'2026-01-01',status:'cancelled',book}]); const cancelled=renderPage(ReservationsPage); expect(await screen.findByText(/Cancelada/)).toBeInTheDocument(); expect(screen.queryByRole('button',{name:'Cancelar reserva'})).not.toBeInTheDocument(); cancelled.unmount()
  mockedReading.mockResolvedValue([{openLibraryKey:'/works/OL1W',title:'Obra',author:'Autora',status:'completed'}]); renderPage(ReadingPage); expect(await screen.findByText('Concluído')).toBeInTheDocument()
})
