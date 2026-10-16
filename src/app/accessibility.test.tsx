import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { LoginPage } from '../features/auth/LoginPage'
import { ThemeProvider } from './theme'

jest.mock('../lib/supabase', () => ({ isSupabaseConfigured: true }))
jest.mock('../features/auth/AuthContext', () => ({
  useAuth: () => ({ user: null, signIn: jest.fn(), signOut: jest.fn() }),
}))

function renderApp(element: React.ReactNode, path = '/') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="*" element={element} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

test('layout público não tem violações automáticas de acessibilidade', async () => {
  const { container } = renderApp(<section><h1>Catálogo da biblioteca</h1></section>)
  expect(await axe(container)).toHaveNoViolations()
})

test('fluxo de login não tem violações automáticas de acessibilidade', async () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const { container } = render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Routes>
          <Route path="*" element={<><Outlet /><LoginPage /></>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  expect(await axe(container)).toHaveNoViolations()
})
