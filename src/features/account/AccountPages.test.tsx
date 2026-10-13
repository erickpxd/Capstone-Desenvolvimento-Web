import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LoansPage, ReadingPage, ReservationsPage, StudentDashboardPage, WishlistPage } from './AccountPages'

jest.mock('../auth/AuthContext', () => ({ useAuth: () => ({ displayName: 'Ana Martins' }) }))

const pages = [
  ['Olá, Ana. Que bom ter você aqui.', StudentDashboardPage],
  ['Cada livro, no seu prazo.', LoansPage],
  ['Sua próxima leitura está a caminho.', ReservationsPage],
  ['Guarde o que desperta sua curiosidade.', WishlistPage],
  ['Uma página de cada vez.', ReadingPage],
] as const

test.each(pages)('renderiza a tela do aluno %s', (title, Page) => {
  render(<MemoryRouter><Page /></MemoryRouter>)
  expect(screen.getByRole('heading', { name: title, level: 1 })).toBeInTheDocument()
})

test('filtra a lista de desejos', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><WishlistPage /></MemoryRouter>)
  await user.click(screen.getByRole('button', { name: 'No acervo (2)' }))
  expect(screen.getByRole('button', { name: 'No acervo (2)' })).toHaveClass('text-primary')
})
