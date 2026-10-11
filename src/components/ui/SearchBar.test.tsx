import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { SearchBar } from './SearchBar'

function CurrentLocation() {
  const location = useLocation()
  return <output>{location.pathname}{location.search}</output>
}

test('normaliza a busca e navega com o termo codificado', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><SearchBar /><Routes><Route path="*" element={<CurrentLocation />} /></Routes></MemoryRouter>)

  await user.type(screen.getByRole('textbox', { name: /pesquisar livros/i }), '  design gráfico  ')
  await user.click(screen.getByRole('button', { name: /buscar livros/i }))

  expect(screen.getByText('/catalogo?q=design%20gr%C3%A1fico')).toBeInTheDocument()
})

test('abre o catálogo sem query quando a busca está vazia', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><SearchBar initialValue="   " /><Routes><Route path="*" element={<CurrentLocation />} /></Routes></MemoryRouter>)
  await user.click(screen.getByRole('button', { name: /buscar livros/i }))
  expect(screen.getByText('/catalogo')).toBeInTheDocument()
})
