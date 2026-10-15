import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '../../app/theme'
import { HomePage } from '../../features/home/HomePage'
import { getInventories } from '../../services/library'
import { searchOpenLibraryBooks } from '../../services/openLibrary'
import type { Book } from '../../types/book'

jest.mock('../../services/library', () => ({ getInventories: jest.fn().mockResolvedValue({}) }))
import { PublicLayout } from './PublicLayout'

jest.mock('../../services/openLibrary', () => ({ searchOpenLibraryBooks: jest.fn().mockResolvedValue({ books: [], total: 0, page: 1, pageSize: 8 }) }))
const mockedSearch=jest.mocked(searchOpenLibraryBooks); const mockedInventories=jest.mocked(getInventories)

const mockSignOut = jest.fn()
jest.mock('../../features/auth/AuthContext', () => ({
  useAuth: () => ({ user: null, signOut: mockSignOut }),
}))

beforeEach(()=>{mockedSearch.mockResolvedValue({books:[],total:0,page:1,pageSize:8});mockedInventories.mockResolvedValue({})})

function renderHome() { const client=new QueryClient({defaultOptions:{queries:{retry:false}}}); return render(<QueryClientProvider client={client}><ThemeProvider><MemoryRouter><Routes><Route element={<PublicLayout/>}><Route path="/" element={<HomePage/>}/></Route></Routes></MemoryRouter></ThemeProvider></QueryClientProvider>) }

test('renderiza home, navegação e rodapé e permite usar o menu móvel e o tema', async () => {
  const user = userEvent.setup()
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}><ThemeProvider>
      <MemoryRouter>
        <Routes><Route element={<PublicLayout />}><Route path="/" element={<HomePage />} /></Route></Routes>
      </MemoryRouter>
    </ThemeProvider></QueryClientProvider>,
  )

  expect(screen.getByRole('heading', { level: 1, name: /seu próximo capítulo/i })).toBeInTheDocument()
  expect(screen.getByText('© 2026 Biblioteca Online')).toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: /catálogo/i }).length).toBeGreaterThan(0)

  await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
  expect(screen.getByRole('navigation', { name: 'Menu móvel' })).toBeInTheDocument()
  await user.click(screen.getAllByRole('button', { name: 'Ativar modo noturno' })[0])
  expect(document.documentElement).toHaveClass('dark')
})

test('exibe livros reais e combina a disponibilidade do acervo', async () => {
  const base:Book={id:'OL1W',openLibraryKey:'/works/OL1W',title:'Obra real',author:'Autora',eyebrow:'AUTORA',category:'Ficção',language:'Português',availability:'catalog-only',availableCopies:0,totalCopies:0,cover:'generic',coverColor:'#fff',coverInk:'#000'}
  const books:Book[]=Array.from({length:6},(_,index)=>({...base,id:`OL${index+1}W`,openLibraryKey:`/works/OL${index+1}W`,title:`Obra ${index+1}`})); books[5]={...books[5],openLibraryKey:undefined}
  mockedSearch.mockResolvedValue({books,total:6,page:1,pageSize:8})
  mockedInventories.mockResolvedValue({'/works/OL1W':{bookId:'b1',totalCopies:2,availableCopies:1},'/works/OL2W':{bookId:'b2',totalCopies:1,availableCopies:0}})
  renderHome(); expect(await screen.findAllByText('Obra 1')).not.toHaveLength(0); expect((await screen.findAllByText(/1 disponível/)).length).toBeGreaterThan(0); expect(screen.getByText('Emprestados')).toBeInTheDocument()
})

test('mostra indisponibilidade da Open Library sem inventar conteúdo', async () => {
  mockedSearch.mockRejectedValue(new Error('offline')); renderHome(); expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível consultar')
})
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
