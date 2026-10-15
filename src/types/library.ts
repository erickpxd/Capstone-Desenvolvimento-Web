export type CopyStatus = 'available' | 'borrowed' | 'maintenance' | 'lost'
export type ReadingState = 'reading' | 'completed'

export interface InventorySummary { bookId: string; totalCopies: number; availableCopies: number }
export interface LibraryBook { id: string; openLibraryKey: string; title: string; author: string; coverUrl?: string; category?: string; publishedYear?: number }
export interface Loan { id: string; borrowedAt: string; dueAt: string; returnedAt?: string; renewals: number; status: 'active' | 'returned'; copy: { id: string; code: string; book: LibraryBook } }
export interface Reservation { id: string; createdAt: string; status: 'active' | 'fulfilled' | 'cancelled'; book: LibraryBook }
export interface SavedBook { openLibraryKey: string; title: string; author: string; coverUrl?: string; createdAt?: string; updatedAt?: string; status?: ReadingState }
export interface LibrarySettings { loanDays: number; maxActiveLoans: number; maxRenewals: number; defaultCopies: number }
export interface CopyRecord { id: string; code: string; status: CopyStatus; book: LibraryBook }
export interface ProfileRecord { userId: string; fullName: string; createdAt: string }

export class LibrarySchemaUnavailableError extends Error {
  constructor() { super('O banco do acervo ainda não foi configurado. Aplique a migration do projeto no Supabase.'); this.name = 'LibrarySchemaUnavailableError' }
}
