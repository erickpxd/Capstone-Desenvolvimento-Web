export type Availability = 'available' | 'borrowed' | 'catalog-only'

export interface Book {
  id: string
  openLibraryKey?: string
  title: string
  author: string
  eyebrow: string
  category: string
  language: string
  year?: number
  popularity?: number
  availability: Availability
  availableCopies: number
  totalCopies: number
  cover: 'dom' | 'cortico' | 'quarto' | 'hora' | 'capitaes' | 'pedagogia' | 'codigo' | 'design' | 'generic'
  coverColor: string
  coverInk: string
  coverImageUrl?: string
  description?: string
  subjects?: string[]
}

export interface CatalogSearchResult {
  books: Book[]
  total: number
  page: number
  pageSize: number
}
