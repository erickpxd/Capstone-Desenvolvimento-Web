import { requireSupabase } from '../lib/supabase'
import type { Book } from '../types/book'
import { LibrarySchemaUnavailableError, type CopyRecord, type InventorySummary, type LibraryBook, type LibrarySettings, type Loan, type ProfileRecord, type Reservation, type SavedBook } from '../types/library'

type DbError = { code?: string; message: string }
type JsonRecord = Record<string, unknown>

function fail(error: DbError | null): never {
  if (error?.code === 'PGRST205' || error?.code === '42P01') throw new LibrarySchemaUnavailableError()
  throw new Error(error?.message || 'Não foi possível concluir a operação no acervo.')
}

export async function getInventory(openLibraryKey: string): Promise<InventorySummary | null> {
  const client = requireSupabase()
  const { data: book, error } = await client.from('library_books').select('id').eq('open_library_key', normalizeKey(openLibraryKey)).maybeSingle()
  if (error) fail(error)
  if (!book) return null
  const { data: copies, error: copiesError } = await client.from('book_copies').select('status').eq('book_id', book.id)
  if (copiesError) fail(copiesError)
  return { bookId: book.id, totalCopies: copies?.length ?? 0, availableCopies: copies?.filter((copy) => copy.status === 'available').length ?? 0 }
}

export async function getInventories(openLibraryKeys: string[]): Promise<Record<string, InventorySummary>> {
  if (!openLibraryKeys.length) return {}
  const client=requireSupabase(); const keys=openLibraryKeys.map(normalizeKey)
  const {data:books,error}=await client.from('library_books').select('id,open_library_key').in('open_library_key',keys)
  if(error) fail(error); if(!books?.length) return {}
  const {data:copies,error:copyError}=await client.from('book_copies').select('book_id,status').in('book_id',books.map((book)=>book.id))
  if(copyError) fail(copyError)
  return Object.fromEntries(books.map((book)=>{const matching=copies?.filter((copy)=>copy.book_id===book.id)??[]; return [book.open_library_key,{bookId:book.id,totalCopies:matching.length,availableCopies:matching.filter((copy)=>copy.status==='available').length}] }))
}

export async function listLoans(): Promise<Loan[]> {
  const { data, error } = await requireSupabase().from('loans').select('id,borrowed_at,due_at,returned_at,renewals,status,copy:book_copies(id,code,book:library_books(id,open_library_key,title,author,cover_url,category,published_year))').order('borrowed_at', { ascending: false })
  if (error) fail(error)
  return (data ?? []).map(mapLoan)
}

export async function listReservations(): Promise<Reservation[]> {
  const { data, error } = await requireSupabase().from('reservations').select('id,created_at,status,book:library_books(id,open_library_key,title,author,cover_url,category,published_year)').order('created_at', { ascending: false })
  if (error) fail(error)
  return (data ?? []).map(mapReservation)
}

export async function listReadingStatuses(): Promise<SavedBook[]> {
  const { data, error } = await requireSupabase().from('reading_statuses').select('open_library_key,title,author,cover_url,status,updated_at').order('updated_at', { ascending: false })
  if (error) fail(error)
  return (data ?? []).map((row) => ({ openLibraryKey: row.open_library_key, title: row.title, author: row.author, coverUrl: row.cover_url ?? undefined, status: row.status, updatedAt: row.updated_at }))
}

export async function listWishlist(): Promise<SavedBook[]> {
  const { data, error } = await requireSupabase().from('wishlist_items').select('open_library_key,title,author,cover_url,created_at').order('created_at', { ascending: false })
  if (error) fail(error)
  return (data ?? []).map((row) => ({ openLibraryKey: row.open_library_key, title: row.title, author: row.author, coverUrl: row.cover_url ?? undefined, createdAt: row.created_at }))
}

export async function borrowBook(bookId: string) { const { error } = await requireSupabase().rpc('borrow_book', { p_book_id: bookId }); if (error) fail(error) }
export async function reserveBook(bookId: string) { const { error } = await requireSupabase().rpc('reserve_book', { p_book_id: bookId }); if (error) fail(error) }
export async function renewLoan(loanId: string) { const { error } = await requireSupabase().rpc('renew_loan', { p_loan_id: loanId }); if (error) fail(error) }
export async function returnLoan(loanId: string) { const { error } = await requireSupabase().rpc('return_loan', { p_loan_id: loanId }); if (error) fail(error) }
export async function fulfillReservation(reservationId: string) { const { error } = await requireSupabase().rpc('fulfill_reservation', { p_reservation_id: reservationId }); if (error) fail(error) }
export async function cancelReservation(reservationId: string) { const { error } = await requireSupabase().rpc('cancel_reservation', { p_reservation_id: reservationId }); if (error) fail(error) }

export async function setReadingStatus(book: Book, status: 'reading' | 'completed' | null) {
  const client = requireSupabase(); const key = normalizeKey(book.openLibraryKey ?? book.id)
  if (!status) { const { error } = await client.from('reading_statuses').delete().eq('open_library_key', key); if (error) fail(error); return }
  const { error } = await client.from('reading_statuses').upsert({ open_library_key: key, title: book.title, author: book.author, cover_url: book.coverImageUrl ?? null, status }, { onConflict: 'user_id,open_library_key' })
  if (error) fail(error)
}

export async function setWishlist(book: Book, enabled: boolean) {
  const client = requireSupabase(); const key = normalizeKey(book.openLibraryKey ?? book.id)
  if (!enabled) { const { error } = await client.from('wishlist_items').delete().eq('open_library_key', key); if (error) fail(error); return }
  const { error } = await client.from('wishlist_items').upsert({ open_library_key: key, title: book.title, author: book.author, cover_url: book.coverImageUrl ?? null }, { onConflict: 'user_id,open_library_key' })
  if (error) fail(error)
}

export async function getSavedState(openLibraryKey: string) {
  const key = normalizeKey(openLibraryKey); const client = requireSupabase()
  const [reading, wish] = await Promise.all([
    client.from('reading_statuses').select('status').eq('open_library_key', key).maybeSingle(),
    client.from('wishlist_items').select('open_library_key').eq('open_library_key', key).maybeSingle(),
  ])
  if (reading.error) fail(reading.error); if (wish.error) fail(wish.error)
  return { readingStatus: reading.data?.status as 'reading' | 'completed' | undefined, wished: Boolean(wish.data) }
}

export async function incorporateBook(book: Book): Promise<string> {
  const { data, error } = await requireSupabase().rpc('incorporate_library_book', { p_open_library_key: normalizeKey(book.openLibraryKey ?? book.id), p_title: book.title, p_author: book.author, p_cover_url: book.coverImageUrl ?? null, p_category: book.category, p_published_year: book.year ?? null, p_metadata: { subjects: book.subjects ?? [], language: book.language } })
  if (error) fail(error)
  return data as string
}

export async function addCopy(bookId: string, code: string) { const { error } = await requireSupabase().from('book_copies').insert({ book_id: bookId, code: code.trim() }); if (error) fail(error) }

export async function getLibrarySettings(): Promise<LibrarySettings> {
  const { data, error } = await requireSupabase().from('library_settings').select('loan_days,max_active_loans,max_renewals,default_copy_count').eq('id', true).single()
  if (error) fail(error)
  return { loanDays: data.loan_days, maxActiveLoans: data.max_active_loans, maxRenewals: data.max_renewals, defaultCopies: data.default_copy_count }
}

export async function updateLibrarySettings(settings: LibrarySettings) {
  const { error } = await requireSupabase().from('library_settings').update({ loan_days: settings.loanDays, max_active_loans: settings.maxActiveLoans, max_renewals: settings.maxRenewals, default_copy_count: settings.defaultCopies, updated_at: new Date().toISOString() }).eq('id', true)
  if (error) fail(error)
}

export async function listLibraryBooks(): Promise<LibraryBook[]> { const {data,error}=await requireSupabase().from('library_books').select('id,open_library_key,title,author,cover_url,category,published_year').order('created_at',{ascending:false}); if(error) fail(error); return (data??[]).map(mapBook) }
export async function listCopies(): Promise<CopyRecord[]> { const {data,error}=await requireSupabase().from('book_copies').select('id,code,status,book:library_books(id,open_library_key,title,author,cover_url,category,published_year)').order('created_at',{ascending:false}); if(error) fail(error); return (data??[]).map((row)=>({id:row.id,code:row.code,status:row.status,book:mapBook(nested(row.book as JsonRecord|JsonRecord[]))})) }
export async function listProfiles(): Promise<ProfileRecord[]> { const {data,error}=await requireSupabase().from('profiles').select('user_id,full_name,created_at').order('created_at',{ascending:false}); if(error) fail(error); return (data??[]).map((row)=>({userId:row.user_id,fullName:row.full_name||'Sem nome',createdAt:row.created_at})) }

function normalizeKey(key: string) { const id = key.replace(/^\/?works\//, ''); return `/works/${id}` }
function nested<T>(value: T | T[]): T { return Array.isArray(value) ? value[0] : value }
function mapBook(row: JsonRecord) { return { id: String(row.id), openLibraryKey: String(row.open_library_key), title: String(row.title), author: String(row.author), coverUrl: row.cover_url ? String(row.cover_url) : undefined, category: row.category ? String(row.category) : undefined, publishedYear: row.published_year ? Number(row.published_year) : undefined } }
function mapLoan(row: JsonRecord): Loan { const copy = nested(row.copy as JsonRecord | JsonRecord[]); return { id: String(row.id), borrowedAt: String(row.borrowed_at), dueAt: String(row.due_at), returnedAt: row.returned_at ? String(row.returned_at) : undefined, renewals: Number(row.renewals), status: row.status as Loan['status'], copy: { id: String(copy.id), code: String(copy.code), book: mapBook(nested(copy.book as JsonRecord | JsonRecord[])) } } }
function mapReservation(row: JsonRecord): Reservation { return { id: String(row.id), createdAt: String(row.created_at), status: row.status as Reservation['status'], book: mapBook(nested(row.book as JsonRecord | JsonRecord[])) } }
