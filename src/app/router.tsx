import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { AccountLayout } from '../features/account/AccountLayout'
import { LoansPage, ReadingPage, ReservationsPage, StudentDashboardPage, WishlistPage } from '../features/account/AccountPages'
import { AdminLayout } from '../features/admin/AdminLayout'
import { AdminDashboardPage, AdminLoansPage, AdminReservationsPage, AdminSettingsPage, CollectionPage, CopiesPage, ReportsPage, StudentAdminProfilePage, StudentsPage } from '../features/admin/AdminPages'
import { AccountPage } from '../features/auth/AccountPage'
import { LoginPage } from '../features/auth/LoginPage'
import { NewPasswordPage, PasswordRecoveryPage } from '../features/auth/PasswordRecoveryPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { SignUpPage } from '../features/auth/SignUpPage'
import { BookDetailsPage } from '../features/books/BookDetailsPage'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { HomePage } from '../features/home/HomePage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'

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
  { path: '/cadastro', element: <SignUpPage /> },
  { path: '/recuperar-senha', element: <PasswordRecoveryPage /> },
  { path: '/recuperar-senha/nova', element: <NewPasswordPage /> },
  {
    path: '/minha-conta',
    element: <ProtectedRoute><AccountLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <StudentDashboardPage /> },
      { path: 'emprestimos', element: <LoansPage /> },
      { path: 'reservas', element: <ReservationsPage /> },
      { path: 'desejos', element: <WishlistPage /> },
      { path: 'leituras', element: <ReadingPage /> },
      { path: 'perfil', element: <AccountPage /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'acervo', element: <CollectionPage /> },
      { path: 'exemplares', element: <CopiesPage /> },
      { path: 'emprestimos', element: <AdminLoansPage /> },
      { path: 'reservas', element: <AdminReservationsPage /> },
      { path: 'estudantes', element: <StudentsPage /> },
      { path: 'estudantes/:studentId', element: <StudentAdminProfilePage /> },
      { path: 'relatorios', element: <ReportsPage /> },
      { path: 'configuracoes', element: <AdminSettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
