import { render, screen } from '@testing-library/react'
import { useAuth } from '../auth/AuthContext'
import { AdminDashboardPage, AdminLoansPage, AdminReservationsPage, AdminSettingsPage, CollectionPage, CopiesPage, ReportsPage, StudentAdminProfilePage, StudentsPage } from './AdminPages'

jest.mock('../auth/AuthContext', () => ({ useAuth: jest.fn() }))
const mockedUseAuth = jest.mocked(useAuth)

beforeEach(() => mockedUseAuth.mockReturnValue({ displayName: 'Admin Real', role: 'admin', user: { id: 'auth-1', email: 'admin@example.com', last_sign_in_at: '2026-10-14T12:00:00Z' } as never, session: {} as never, isLoading: false, signIn: jest.fn(), signOut: jest.fn() }))

const pages = [
  ['Visão geral', AdminDashboardPage], ['Gestão do acervo', CollectionPage], ['Exemplares', CopiesPage], ['Empréstimos', AdminLoansPage], ['Reservas', AdminReservationsPage], ['Estudantes', StudentsPage], ['Perfil do estudante', StudentAdminProfilePage], ['Relatórios', ReportsPage], ['Configurações', AdminSettingsPage],
] as const

test.each(pages)('renderiza %s sem registros administrativos inventados', (title, Page) => {
  render(<Page />)
  expect(screen.getByRole('heading', { name: title, level: 1 })).toBeInTheDocument()
  expect(screen.getByText(/banco interno não configurado/i)).toBeInTheDocument()
  expect(screen.queryByText('Ana Martins')).not.toBeInTheDocument()
})

test('mostra somente os dados reais da sessão administrativa', () => {
  render(<AdminSettingsPage />)
  expect(screen.getByText('Admin Real')).toBeInTheDocument()
  expect(screen.getByText('admin@example.com')).toBeInTheDocument()
  expect(screen.getByText('auth-1')).toBeInTheDocument()
})

test('não inventa metadados ausentes da sessão', () => {
  mockedUseAuth.mockReturnValue({ displayName: 'Estudante', role: 'student', user: null, session: null, isLoading: false, signIn: jest.fn(), signOut: jest.fn() })
  render(<AdminSettingsPage />)
  expect(screen.getAllByText('Estudante').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Não informado').length).toBeGreaterThan(0)
})
