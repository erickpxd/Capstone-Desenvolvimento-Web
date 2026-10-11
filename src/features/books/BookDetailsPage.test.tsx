import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { BookDetailsPage } from './BookDetailsPage'

function renderDetails(id: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[`/livros/${id}`]}><Routes>
    <Route path="/livros/:bookId" element={<BookDetailsPage />} />
    <Route path="/entrar" element={<p>Tela de login</p>} />
  </Routes></MemoryRouter></QueryClientProvider>)
}

test('mostra detalhes locais e abre e fecha solicitação protegida', async () => {
  const user = userEvent.setup()
  renderDetails('dom-casmurro')
  expect(screen.getByRole('heading', { level: 1, name: 'Dom Casmurro' })).toBeInTheDocument()
  expect(screen.getByText(/de 5 cópias disponíveis/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /solicitar empréstimo/i }))
  expect(screen.getByRole('dialog')).toHaveTextContent('Entre para continuar')
  await user.click(screen.getByRole('button', { name: 'Fechar' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('explica quando a universidade não possui exemplar', () => {
  renderDetails('quarto-de-despejo')
  expect(screen.getByText(/não possui exemplares desta obra/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /solicitar empréstimo/i })).not.toBeInTheDocument()
})
