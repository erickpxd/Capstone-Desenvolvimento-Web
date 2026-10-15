import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { searchOpenLibraryBooks } from '../../services/openLibrary'
import { LoansPage, ReadingPage, ReservationsPage, StudentDashboardPage, WishlistPage } from './AccountPages'

jest.mock('../auth/AuthContext', () => ({ useAuth: () => ({ displayName: 'João Silva', user: { email: 'joao@example.com' } }) }))
jest.mock('../../services/openLibrary', () => ({ searchOpenLibraryBooks: jest.fn() }))
const mockedSearch = jest.mocked(searchOpenLibraryBooks)

function renderPage(Page: () => JSX.Element) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter><Page /></MemoryRouter></QueryClientProvider>)
}

beforeEach(() => mockedSearch.mockResolvedValue({ books: [], total: 0, page: 1, pageSize: 4 }))

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
