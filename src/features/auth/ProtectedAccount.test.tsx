import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { AccountPage } from './AccountPage'
import { ProtectedRoute } from './ProtectedRoute'

jest.mock('./AuthContext', () => ({ useAuth: jest.fn() }))
const mockedUseAuth = jest.mocked(useAuth)

test('redireciona visitante para login e preserva o destino', () => {
  mockedUseAuth.mockReturnValue({ user: null, session: null, isLoading: false, signOut: jest.fn() })
  render(<MemoryRouter initialEntries={['/minha-conta']}><Routes>
    <Route path="/minha-conta" element={<ProtectedRoute><p>Privado</p></ProtectedRoute>} />
    <Route path="/entrar" element={<p>Login necessário</p>} />
  </Routes></MemoryRouter>)
  expect(screen.getByText('Login necessário')).toBeInTheDocument()
})

test('mostra validação enquanto a sessão carrega', () => {
  mockedUseAuth.mockReturnValue({ user: null, session: null, isLoading: true, signOut: jest.fn() })
  render(<MemoryRouter><ProtectedRoute><p>Privado</p></ProtectedRoute></MemoryRouter>)
  expect(screen.getByRole('status')).toHaveTextContent('Validando sua sessão')
})

test('exibe a conta e conclui logout', async () => {
  const user = userEvent.setup()
  const logout = jest.fn().mockResolvedValue(undefined)
  mockedUseAuth.mockReturnValue({ user: { email: 'aluno@example.com' } as never, session: {} as never, isLoading: false, signOut: logout })
  render(<MemoryRouter initialEntries={['/minha-conta']}><Routes>
    <Route path="/minha-conta" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
    <Route path="/" element={<p>Página inicial</p>} />
  </Routes></MemoryRouter>)
  expect(screen.getByText('aluno@example.com')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /sair da conta/i }))
  expect(logout).toHaveBeenCalled()
  expect(await screen.findByText('Página inicial')).toBeInTheDocument()
})

test('informa falha no logout', async () => {
  const user = userEvent.setup()
  mockedUseAuth.mockReturnValue({ user: { email: 'aluno@example.com' } as never, session: {} as never, isLoading: false, signOut: jest.fn().mockRejectedValue(new Error('Falha ao sair')) })
  render(<MemoryRouter><AccountPage /></MemoryRouter>)
  await user.click(screen.getByRole('button', { name: /sair da conta/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao sair')
})
