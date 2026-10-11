import { getOpenLibraryWork, searchOpenLibraryBooks } from './openLibrary'

const mockedFetch = jest.fn()
global.fetch = mockedFetch

beforeEach(() => mockedFetch.mockReset())

test('consulta a API externa e converte o resultado para o domínio da aplicação', async () => {
  mockedFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ numFound: 1, docs: [{ key: '/works/OL1W', title: 'Livro remoto', author_name: ['Autora'], first_publish_year: 2020, language: ['por'], subject: ['Educação'] }] }),
  })

  const result = await searchOpenLibraryBooks({ query: 'educação', page: 2, pageSize: 8 })

  expect(mockedFetch).toHaveBeenCalledWith(expect.stringContaining('/search.json?'), expect.objectContaining({ headers: { Accept: 'application/json' } }))
  expect(mockedFetch.mock.calls[0][0]).toContain('q=educa%C3%A7%C3%A3o')
  expect(result).toMatchObject({ total: 1, page: 2, books: [{ id: 'OL1W', title: 'Livro remoto', author: 'Autora', language: 'Português' }] })
})

test('busca obra e autor e trata descrição estruturada', async () => {
  mockedFetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ key: '/works/OL2W', title: 'Obra', description: { value: '**Descrição**' }, authors: [{ author: { key: '/authors/OL9A' } }] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ name: 'Nome da Autora' }) })

  const book = await getOpenLibraryWork('OL2W')
  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(book).toMatchObject({ title: 'Obra', author: 'Nome da Autora', description: 'Descrição' })
})

test('traduz resposta 404 em erro de domínio', async () => {
  mockedFetch.mockResolvedValue({ ok: false, status: 404 })
  await expect(getOpenLibraryWork('inexistente')).rejects.toThrow('Livro não encontrado')
})
