import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { LoginPage } from '../features/auth/LoginPage'
import { AccountPage } from '../features/auth/AccountPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
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
      { path: '/minha-conta', element: <ProtectedRoute><AccountPage /></ProtectedRoute> },
    ],
  },
  { path: '/entrar', element: <LoginPage /> },
])
