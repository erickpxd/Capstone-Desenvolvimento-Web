import type { Book, CatalogSearchResult } from '../types/book'

const API_URL = 'https://openlibrary.org'
const COVERS_URL = 'https://covers.openlibrary.org'

interface SearchDocument {
  key: string
  title: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number
  language?: string[]
  subject?: string[]
  edition_count?: number
}

interface SearchResponse {
  numFound: number
  docs: SearchDocument[]
}

interface WorkResponse {
  key: string
  title: string
  description?: string | { value?: string }
  covers?: number[]
  subjects?: string[]
  first_publish_date?: string
  authors?: Array<{ author?: { key?: string } }>
}

interface AuthorResponse { name?: string }

export interface SearchBooksOptions {
  query?: string
  genre?: string
  language?: string
  page?: number
  pageSize?: number
  sort?: 'relevance' | 'new' | 'old' | 'popular' | 'author'
  signal?: AbortSignal
}

export async function searchOpenLibraryBooks({ query = '', genre = '', language = '', page = 1, pageSize = 8, sort = 'relevance', signal }: SearchBooksOptions = {}): Promise<CatalogSearchResult> {
  const clauses = [query.trim() || 'language:por']
  if (genre) clauses.push(`subject:"${genre}"`)
  if (language) clauses.push(`language:${language}`)

  const params = new URLSearchParams({
    q: clauses.join(' '),
    fields: 'key,title,author_name,first_publish_year,cover_i,language,subject,edition_count',
    page: String(page),
    limit: String(pageSize),
    lang: 'pt',
  })
  if (sort === 'popular') params.set('sort', 'editions')
  else if (sort !== 'relevance' && sort !== 'author') params.set('sort', sort)

  const response = await fetch(`${API_URL}/search.json?${params}`, { headers: { Accept: 'application/json' }, signal })
  if (!response.ok) throw new Error(`Open Library indisponível (${response.status})`)
  const data = await response.json() as SearchResponse

  return {
    books: data.docs.map(mapSearchDocument).sort(sort === 'author' ? (a, b) => a.author.localeCompare(b.author, 'pt-BR') : undefined),
    total: data.numFound,
    page,
    pageSize,
  }
}

export async function getOpenLibraryWork(workId: string, signal?: AbortSignal): Promise<Book> {
  const id = workId.replace(/^\/?works\//, '')
  const response = await fetch(`${API_URL}/works/${encodeURIComponent(id)}.json`, { headers: { Accept: 'application/json' }, signal })
  if (!response.ok) throw new Error(response.status === 404 ? 'Livro não encontrado' : `Open Library indisponível (${response.status})`)
  const work = await response.json() as WorkResponse
  const authorKey = work.authors?.[0]?.author?.key
  let author = 'Autor não informado'
  if (authorKey) {
    const authorResponse = await fetch(`${API_URL}${authorKey}.json`, { headers: { Accept: 'application/json' }, signal })
    if (authorResponse.ok) author = ((await authorResponse.json()) as AuthorResponse).name ?? author
  }

  return {
    ...catalogOnlyDefaults,
    id,
    openLibraryKey: work.key,
    title: work.title,
    author,
    eyebrow: author.toUpperCase(),
    year: parseYear(work.first_publish_date),
    category: work.subjects?.[0] ?? 'Catálogo público',
    language: 'Não informado',
    cover: 'generic',
    coverImageUrl: coverUrl(work.covers?.[0], 'L'),
    description: descriptionText(work.description),
    subjects: work.subjects?.slice(0, 6),
  }
}

function mapSearchDocument(document: SearchDocument): Book {
  const author = document.author_name?.[0] ?? 'Autor não informado'
  return {
    ...catalogOnlyDefaults,
    id: document.key.replace('/works/', ''),
    openLibraryKey: document.key,
    title: document.title,
    author,
    eyebrow: author.toUpperCase(),
    category: preferredSubject(document.subject),
    language: languageName(document.language?.[0]),
    year: document.first_publish_year,
    popularity: document.edition_count,
    cover: 'generic',
    coverImageUrl: coverUrl(document.cover_i, 'M'),
    subjects: document.subject?.slice(0, 6),
  }
}

const catalogOnlyDefaults: Pick<Book, 'availability' | 'availableCopies' | 'totalCopies' | 'coverColor' | 'coverInk'> = {
  availability: 'catalog-only', availableCopies: 0, totalCopies: 0, coverColor: '#DCE5EC', coverInk: '#243541',
}

function coverUrl(id?: number, size: 'M' | 'L' = 'M') { return id && id > 0 ? `${COVERS_URL}/b/id/${id}-${size}.jpg?default=false` : undefined }
function preferredSubject(subjects?: string[]) { return subjects?.find((subject) => subject.length <= 32) ?? 'Catálogo público' }
function languageName(code?: string) { return ({ por: 'Português', eng: 'Inglês', spa: 'Espanhol' } as Record<string, string>)[code ?? ''] ?? 'Não informado' }
function parseYear(value?: string) { const match = value?.match(/\d{4}/); return match ? Number(match[0]) : undefined }
function descriptionText(value?: WorkResponse['description']) { const text = typeof value === 'string' ? value : value?.value; return text?.replace(/[*_#`]/g, '').replace(/\[(.*?)\]\([^)]*\)/g, '$1').trim() }
