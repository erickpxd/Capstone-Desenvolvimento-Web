import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminDashboardPage, AdminLoansPage, AdminReservationsPage, AdminSettingsPage, CollectionPage, CopiesPage, ReportsPage, StudentAdminProfilePage, StudentsPage } from './AdminPages'
import { toneForStatus } from './adminData'

const pages = [
  ['Visão geral', AdminDashboardPage], ['Gestão do acervo', CollectionPage], ['Exemplares', CopiesPage], ['Empréstimos', AdminLoansPage], ['Reservas', AdminReservationsPage], ['Estudantes', StudentsPage], ['Ana Martins', StudentAdminProfilePage], ['Relatórios', ReportsPage], ['Configurações', AdminSettingsPage],
] as const

test.each(pages)('renderiza a página administrativa %s', (title, Page) => {
  render(<MemoryRouter><Page /></MemoryRouter>)
  expect(screen.getByRole('heading', { name: title, level: 1 })).toBeInTheDocument()
  expect(screen.getByText(/dados demonstrativos/i)).toBeInTheDocument()
})

test('filtra o acervo e estudantes sem alterar os dados de origem', async () => {
  const user = userEvent.setup()
  const { unmount } = render(<MemoryRouter><CollectionPage /></MemoryRouter>)
  await user.type(screen.getByPlaceholderText(/buscar por título/i), 'Dom Casmurro')
  expect(screen.getByText('Dom Casmurro')).toBeInTheDocument()
  expect(screen.queryByText('O Cortiço')).not.toBeInTheDocument()
  unmount()

  render(<MemoryRouter><StudentsPage /></MemoryRouter>)
  await user.type(screen.getByPlaceholderText(/buscar nome/i), 'Bruno')
  expect(screen.getByText('Bruno Lima')).toBeInTheDocument()
  expect(screen.queryByText('Ana Martins')).not.toBeInTheDocument()
})

test('classifica os estados administrativos', () => {
  expect(toneForStatus('Disponível')).toBe('success')
  expect(toneForStatus('Em atraso')).toBe('danger')
  expect(toneForStatus('Reservado')).toBe('info')
  expect(toneForStatus('Manutenção')).toBe('warning')
  expect(toneForStatus('Sem cópias')).toBe('neutral')
})
