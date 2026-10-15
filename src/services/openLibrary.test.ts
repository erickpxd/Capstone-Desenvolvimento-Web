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

test('monta filtros, ordenação e valores padrão da busca', async () => {
  mockedFetch.mockResolvedValue({ ok: true, json: async () => ({ numFound: 1, docs: [{ key: '/works/OL3W', title: 'Sem metadados' }] }) })
  const result = await searchOpenLibraryBooks({ genre: 'Design', language: 'eng', sort: 'new' })
  const url = mockedFetch.mock.calls[0][0] as string
  expect(url).toContain('subject%3A%22Design%22')
  expect(url).toContain('language%3Aeng')
  expect(url).toContain('sort=new')
  expect(result.books[0]).toMatchObject({ author: 'Autor não informado', category: 'Catálogo público', language: 'Não informado' })
})

test('trata indisponibilidade da busca e da obra', async () => {
  mockedFetch.mockResolvedValueOnce({ ok: false, status: 503 })
  await expect(searchOpenLibraryBooks()).rejects.toThrow('Open Library indisponível (503)')
  mockedFetch.mockResolvedValueOnce({ ok: false, status: 500 })
  await expect(getOpenLibraryWork('/works/OL4W')).rejects.toThrow('Open Library indisponível (500)')
})

test('usa fallback quando obra não possui autor, descrição ou ano', async () => {
  mockedFetch.mockResolvedValue({ ok: true, json: async () => ({ key: '/works/OL5W', title: 'Obra mínima', covers: [-1], subjects: [] }) })
  const book = await getOpenLibraryWork('/works/OL5W')
  expect(book).toMatchObject({ author: 'Autor não informado', category: 'Catálogo público', year: undefined, coverImageUrl: undefined, description: undefined })
})

test('mantém autor padrão quando a consulta do autor falha', async () => {
  mockedFetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ key: '/works/OL6W', title: 'Obra', description: 'Texto', first_publish_date: 'Publicado em 1999', authors: [{ author: { key: '/authors/A1' } }] }) })
    .mockResolvedValueOnce({ ok: false, status: 500 })
  const book = await getOpenLibraryWork('OL6W')
  expect(book).toMatchObject({ author: 'Autor não informado', year: 1999, description: 'Texto' })
})

test('ordena autores e usa número de edições como popularidade documentada', async () => {
  mockedFetch.mockResolvedValue({ ok: true, json: async () => ({ numFound: 2, docs: [
    { key: '/works/OL8W', title: 'B', author_name: ['Zilda'], edition_count: 4 },
    { key: '/works/OL7W', title: 'A', author_name: ['Ana'], edition_count: 10 },
  ] }) })
  const byAuthor=await searchOpenLibraryBooks({sort:'author'})
  expect(byAuthor.books.map((book)=>book.author)).toEqual(['Ana','Zilda'])
  expect(byAuthor.books[0].popularity).toBe(10)
  await searchOpenLibraryBooks({sort:'popular'})
  expect(mockedFetch.mock.calls[1][0]).toContain('sort=editions')
})
