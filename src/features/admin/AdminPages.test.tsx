import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { addCopy, fulfillReservation, getLibrarySettings, incorporateBook, listCopies, listLibraryBooks, listLoans, listProfiles, listReservations, returnLoan, updateLibrarySettings } from '../../services/library'
import { getOpenLibraryWork } from '../../services/openLibrary'
import { useAuth } from '../auth/AuthContext'
import { AdminDashboardPage, AdminLoansPage, AdminReservationsPage, AdminSettingsPage, CollectionPage, CopiesPage, ReportsPage, StudentAdminProfilePage, StudentsPage } from './AdminPages'

jest.mock('../auth/AuthContext', () => ({ useAuth: jest.fn() }))
jest.mock('../../services/library', () => ({
  listLibraryBooks: jest.fn().mockResolvedValue([]), listCopies: jest.fn().mockResolvedValue([]),
  listLoans: jest.fn().mockResolvedValue([]), listReservations: jest.fn().mockResolvedValue([]),
  listProfiles: jest.fn().mockResolvedValue([]), getLibrarySettings: jest.fn().mockRejectedValue(new (jest.requireActual('../../types/library').LibrarySchemaUnavailableError)()),
  incorporateBook: jest.fn(), addCopy: jest.fn(), returnLoan: jest.fn(), fulfillReservation: jest.fn(), updateLibrarySettings: jest.fn(),
}))
jest.mock('../../services/openLibrary', () => ({ getOpenLibraryWork: jest.fn() }))
const mockedUseAuth = jest.mocked(useAuth)
const books=jest.mocked(listLibraryBooks); const copies=jest.mocked(listCopies); const loans=jest.mocked(listLoans); const reservations=jest.mocked(listReservations); const profiles=jest.mocked(listProfiles); const settings=jest.mocked(getLibrarySettings)

beforeEach(() => { mockedUseAuth.mockReturnValue({ displayName: 'Admin Real', role: 'admin', user: { id: 'auth-1', email: 'admin@example.com', last_sign_in_at: '2026-10-14T12:00:00Z' } as never, session: {} as never, isLoading: false, signIn: jest.fn(), signOut: jest.fn() }); books.mockResolvedValue([]); copies.mockResolvedValue([]); loans.mockResolvedValue([]); reservations.mockResolvedValue([]); profiles.mockResolvedValue([]); settings.mockRejectedValue(new (jest.requireActual('../../types/library').LibrarySchemaUnavailableError)()) })

const pages = [
  ['Visão geral', AdminDashboardPage], ['Gestão do acervo', CollectionPage], ['Exemplares', CopiesPage], ['Empréstimos', AdminLoansPage], ['Reservas', AdminReservationsPage], ['Estudantes', StudentsPage], ['Perfil do estudante', StudentAdminProfilePage], ['Relatórios', ReportsPage], ['Configurações', AdminSettingsPage],
] as const

function renderPage(Page: () => JSX.Element) { const client=new QueryClient({defaultOptions:{queries:{retry:false}}}); return render(<QueryClientProvider client={client}><Page/></QueryClientProvider>) }

test.each(pages)('renderiza %s sem registros administrativos inventados', (title, Page) => {
  renderPage(Page)
  expect(screen.getByRole('heading', { name: title, level: 1 })).toBeInTheDocument()
  expect(screen.queryByText('Ana Martins')).not.toBeInTheDocument()
})

test('mostra somente os dados reais da sessão administrativa', () => {
  renderPage(AdminSettingsPage)
  expect(screen.getByText('Admin Real')).toBeInTheDocument()
  expect(screen.getByText('admin@example.com')).toBeInTheDocument()
  expect(screen.getByText('auth-1')).toBeInTheDocument()
})

test('não inventa metadados ausentes da sessão', () => {
  mockedUseAuth.mockReturnValue({ displayName: 'Estudante', role: 'student', user: null, session: null, isLoading: false, signIn: jest.fn(), signOut: jest.fn() })
  renderPage(AdminSettingsPage)
  expect(screen.getAllByText('Estudante').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Não informado').length).toBeGreaterThan(0)
})

test('executa os fluxos administrativos de acervo e circulação', async () => {
  const user=userEvent.setup(); const libraryBook={id:'b1',openLibraryKey:'/works/OL1W',title:'Obra',author:'Autora'}
  jest.mocked(getOpenLibraryWork).mockResolvedValue({id:'OL1W',openLibraryKey:'/works/OL1W',title:'Obra',author:'Autora',eyebrow:'A',category:'Ficção',language:'Português',availability:'catalog-only',availableCopies:0,totalCopies:0,cover:'generic',coverColor:'#fff',coverInk:'#000'})
  const collection=renderPage(CollectionPage); await user.type(screen.getByLabelText(/id da obra/i),'OL1W'); await user.click(screen.getByRole('button',{name:'Incorporar obra'})); expect(incorporateBook).toHaveBeenCalled(); collection.unmount()
  books.mockResolvedValue([libraryBook]); const copyPage=renderPage(CopiesPage); await screen.findByRole('option',{name:'Obra'}); await user.selectOptions(screen.getByLabelText('Obra'),'b1'); await user.type(screen.getByLabelText('Código patrimonial'),'C-1'); await user.click(screen.getByRole('button',{name:'Adicionar'})); expect(jest.mocked(addCopy).mock.calls[0][0]).toBe('b1'); expect(jest.mocked(addCopy).mock.calls[0][1]).toBe('C-1'); copyPage.unmount()
  loans.mockResolvedValue([{id:'l1',borrowedAt:'2026-01-01',dueAt:'2026-01-10',renewals:0,status:'active',copy:{id:'c1',code:'C-1',book:libraryBook}}]); const loanPage=renderPage(AdminLoansPage); await user.click(await screen.findByRole('button',{name:'Registrar devolução'})); expect(jest.mocked(returnLoan).mock.calls[0][0]).toBe('l1'); loanPage.unmount()
  reservations.mockResolvedValue([{id:'r1',createdAt:'2026-01-01',status:'active',book:libraryBook}]); renderPage(AdminReservationsPage); await user.click(await screen.findByRole('button',{name:'Atender reserva'})); expect(jest.mocked(fulfillReservation).mock.calls[0][0]).toBe('r1')
})

test('edita políticas configuráveis da biblioteca', async () => {
  settings.mockResolvedValue({loanDays:14,maxActiveLoans:3,maxRenewals:1,defaultCopies:2}); const user=userEvent.setup(); renderPage(AdminSettingsPage)
  const field=await screen.findByLabelText('Prazo (dias)'); await user.clear(field); await user.type(field,'21'); await user.click(screen.getByRole('button',{name:'Salvar políticas'}))
  expect(jest.mocked(updateLibrarySettings).mock.calls[0][0]).toEqual(expect.objectContaining({loanDays:21}))
})
