import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { LoginPage } from '../features/auth/LoginPage'
import { BookDetailsPage } from '../features/books/BookDetailsPage'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { HomePage } from '../features/home/HomePage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalogo', element: <CatalogPage /> },
      { path: '/livros/:bookId', element: <BookDetailsPage /> },
    ],
  },
  { path: '/entrar', element: <LoginPage /> },
])
