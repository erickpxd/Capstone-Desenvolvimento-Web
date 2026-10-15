import { requireSupabase } from '../lib/supabase'
import { LibrarySchemaUnavailableError } from '../types/library'
import { addCopy, borrowBook, cancelReservation, fulfillReservation, getInventories, getInventory, getLibrarySettings, getSavedState, incorporateBook, listCopies, listLibraryBooks, listLoans, listProfiles, listReadingStatuses, listReservations, listWishlist, renewLoan, reserveBook, returnLoan, setReadingStatus, setWishlist, updateLibrarySettings } from './library'

jest.mock('../lib/supabase', () => ({ requireSupabase: jest.fn() }))
const mockedRequire = jest.mocked(requireSupabase)

test('executa empréstimo pela função transacional do banco', async () => {
  const rpc=jest.fn().mockResolvedValue({error:null}); mockedRequire.mockReturnValue({rpc} as never)
  await borrowBook('book-1')
  expect(rpc).toHaveBeenCalledWith('borrow_book',{p_book_id:'book-1'})
})

test('traduz ausência do esquema em erro de domínio compreensível', async () => {
  const order=jest.fn().mockResolvedValue({data:null,error:{code:'PGRST205',message:'missing'}})
  const select=jest.fn().mockReturnValue({order}); mockedRequire.mockReturnValue({from:jest.fn().mockReturnValue({select})} as never)
  await expect(listLoans()).rejects.toBeInstanceOf(LibrarySchemaUnavailableError)
})

test('salva e remove desejo sem criar registros duplicados', async () => {
  const upsert=jest.fn().mockResolvedValue({error:null}); const eq=jest.fn().mockResolvedValue({error:null}); const remove=jest.fn().mockReturnValue({eq})
  mockedRequire.mockReturnValue({from:jest.fn().mockReturnValue({upsert,delete:remove})} as never)
  const book={id:'OL1W',openLibraryKey:'/works/OL1W',title:'Obra',author:'Autora',eyebrow:'AUTORA',category:'Literatura',language:'Português',availability:'catalog-only' as const,availableCopies:0,totalCopies:0,cover:'generic' as const,coverColor:'#fff',coverInk:'#000'}
  await setWishlist(book,true); await setWishlist(book,false)
  expect(upsert).toHaveBeenCalledWith(expect.objectContaining({open_library_key:'/works/OL1W',title:'Obra'}),{onConflict:'user_id,open_library_key'})
  expect(remove).toHaveBeenCalled(); expect(eq).toHaveBeenCalledWith('open_library_key','/works/OL1W')
})

function builder(data: unknown, error: unknown = null) {
  const value: Record<string, jest.Mock | ((resolve: (result: unknown) => unknown) => Promise<unknown>)>={}
  for(const method of ['select','eq','in','order','maybeSingle','single','upsert','delete','update','insert']) value[method]=jest.fn(()=>value)
  value.then=(resolve: (result: unknown) => unknown)=>(Promise.resolve({data,error}).then(resolve))
  return value
}

test('mapeia inventário individual e em lote sem confundir catálogo público', async () => {
  const books=builder({id:'b1'}); const copies=builder([{status:'available'},{status:'borrowed'}])
  mockedRequire.mockReturnValue({from:jest.fn((table)=>table==='library_books'?books:copies)} as never)
  await expect(getInventory('OL1W')).resolves.toEqual({bookId:'b1',totalCopies:2,availableCopies:1})

  const manyBooks=builder([{id:'b1',open_library_key:'/works/OL1W'}]); const manyCopies=builder([{book_id:'b1',status:'available'}])
  mockedRequire.mockReturnValue({from:jest.fn((table)=>table==='library_books'?manyBooks:manyCopies)} as never)
  await expect(getInventories(['/works/OL1W'])).resolves.toEqual({'/works/OL1W':{bookId:'b1',totalCopies:1,availableCopies:1}})
  await expect(getInventories([])).resolves.toEqual({})
})

test('retorna nulo quando uma obra não pertence ao acervo', async () => {
  mockedRequire.mockReturnValue({from:jest.fn().mockReturnValue(builder(null))} as never)
  await expect(getInventory('OL404W')).resolves.toBeNull()
})

test('mapeia empréstimos, reservas, leituras, desejos, cópias e perfis', async () => {
  const book={id:'b1',open_library_key:'/works/OL1W',title:'Obra',author:'Autora',cover_url:null,category:'Ficção',published_year:2020}
  const rows:Record<string,unknown[]>= {
    loans:[{id:'l1',borrowed_at:'2026-01-01',due_at:'2026-01-10',returned_at:null,renewals:0,status:'active',copy:{id:'c1',code:'C-1',book}}],
    reservations:[{id:'r1',created_at:'2026-01-01',status:'active',book}],
    reading_statuses:[{open_library_key:'/works/OL1W',title:'Obra',author:'Autora',cover_url:null,status:'reading',updated_at:'2026-01-01'}],
    wishlist_items:[{open_library_key:'/works/OL1W',title:'Obra',author:'Autora',cover_url:null,created_at:'2026-01-01'}],
    library_books:[book], book_copies:[{id:'c1',code:'C-1',status:'available',book}],
    profiles:[{user_id:'u1',full_name:'Pessoa',created_at:'2026-01-01'}],
  }
  mockedRequire.mockReturnValue({from:jest.fn((table)=>builder(rows[table]))} as never)
  expect((await listLoans())[0].copy.book.title).toBe('Obra')
  expect((await listReservations())[0].book.id).toBe('b1')
  expect((await listReadingStatuses())[0].status).toBe('reading')
  expect((await listWishlist())[0].title).toBe('Obra')
  expect((await listLibraryBooks())[0].openLibraryKey).toBe('/works/OL1W')
  expect((await listCopies())[0].code).toBe('C-1')
  expect((await listProfiles())[0].fullName).toBe('Pessoa')
})

test('executa as operações RPC de circulação', async () => {
  const rpc=jest.fn().mockResolvedValue({error:null}); mockedRequire.mockReturnValue({rpc} as never)
  await reserveBook('b1'); await renewLoan('l1'); await returnLoan('l1'); await cancelReservation('r1'); await fulfillReservation('r1')
  expect(rpc.mock.calls.map((call)=>call[0])).toEqual(['reserve_book','renew_loan','return_loan','cancel_reservation','fulfill_reservation'])
})

test('persiste estados de leitura e consulta estados salvos', async () => {
  const reading=builder({status:'completed'}); const wishlist=builder({open_library_key:'/works/OL1W'})
  const from=jest.fn((table)=>table==='reading_statuses'?reading:wishlist); mockedRequire.mockReturnValue({from} as never)
  const book={id:'OL1W',title:'Obra',author:'Autora',eyebrow:'A',category:'Ficção',language:'Português',availability:'catalog-only' as const,availableCopies:0,totalCopies:0,cover:'generic' as const,coverColor:'#fff',coverInk:'#000'}
  await setReadingStatus(book,'reading'); await setReadingStatus(book,null)
  await expect(getSavedState('/works/OL1W')).resolves.toEqual({readingStatus:'completed',wished:true})
})

test('incorpora obras, adiciona cópias e gerencia políticas', async () => {
  const copies=builder(null); const settings=builder({loan_days:14,max_active_loans:3,max_renewals:1,default_copy_count:2}); const rpc=jest.fn().mockResolvedValue({data:'b1',error:null})
  mockedRequire.mockReturnValue({rpc,from:jest.fn((table)=>table==='book_copies'?copies:settings)} as never)
  const book={id:'OL1W',openLibraryKey:'/works/OL1W',title:'Obra',author:'Autora',eyebrow:'A',category:'Ficção',language:'Português',year:2020,availability:'catalog-only' as const,availableCopies:0,totalCopies:0,cover:'generic' as const,coverColor:'#fff',coverInk:'#000'}
  await expect(incorporateBook(book)).resolves.toBe('b1'); await addCopy('b1',' C-1 ')
  await expect(getLibrarySettings()).resolves.toEqual({loanDays:14,maxActiveLoans:3,maxRenewals:1,defaultCopies:2})
  await updateLibrarySettings({loanDays:21,maxActiveLoans:4,maxRenewals:2,defaultCopies:2})
})

test('propaga erros reais de todas as operações sem mascará-los', async () => {
  const rpc=jest.fn().mockResolvedValue({error:{code:'XX000',message:'falha real'}}); mockedRequire.mockReturnValue({rpc} as never)
  for(const operation of [()=>borrowBook('b'),()=>reserveBook('b'),()=>renewLoan('l'),()=>returnLoan('l'),()=>cancelReservation('r'),()=>fulfillReservation('r')]) await expect(operation()).rejects.toThrow('falha real')

  const failed=builder(null,{code:'XX000',message:'consulta falhou'}); mockedRequire.mockReturnValue({from:jest.fn().mockReturnValue(failed)} as never)
  for(const operation of [listLoans,listReservations,listReadingStatuses,listWishlist,listLibraryBooks,listCopies,listProfiles,getLibrarySettings]) await expect(operation()).rejects.toThrow('consulta falhou')
})

test('trata coleções vazias e metadados opcionais ausentes', async () => {
  const emptyBooks=builder([]); mockedRequire.mockReturnValue({from:jest.fn().mockReturnValue(emptyBooks)} as never)
  await expect(getInventories(['/works/OL1W'])).resolves.toEqual({})
  const minimal={id:'b1',open_library_key:'/works/OL1W',title:'Obra',author:'Autora',cover_url:null,category:null,published_year:null}
  const rows:Record<string,unknown[]>={library_books:[minimal],profiles:[{user_id:'u1',full_name:'',created_at:'2026-01-01'}]}
  mockedRequire.mockReturnValue({from:jest.fn((table)=>builder(rows[table]??[]))} as never)
  expect((await listLibraryBooks())[0]).toEqual(expect.objectContaining({coverUrl:undefined,category:undefined,publishedYear:undefined}))
  expect((await listProfiles())[0].fullName).toBe('Sem nome')
})

test('trata ausência de estados salvos e falhas nas escritas pessoais', async () => {
  mockedRequire.mockReturnValue({from:jest.fn().mockReturnValue(builder(null))} as never)
  await expect(getSavedState('OL1W')).resolves.toEqual({readingStatus:undefined,wished:false})
  const failed=builder(null,{code:'XX000',message:'escrita falhou'}); mockedRequire.mockReturnValue({from:jest.fn().mockReturnValue(failed)} as never)
  const book={id:'OL1W',title:'Obra',author:'Autora',eyebrow:'A',category:'Ficção',language:'Português',availability:'catalog-only' as const,availableCopies:0,totalCopies:0,cover:'generic' as const,coverColor:'#fff',coverInk:'#000'}
  await expect(setReadingStatus(book,'completed')).rejects.toThrow('escrita falhou')
  await expect(setReadingStatus(book,null)).rejects.toThrow('escrita falhou')
  await expect(setWishlist(book,true)).rejects.toThrow('escrita falhou')
  await expect(setWishlist(book,false)).rejects.toThrow('escrita falhou')
  await expect(addCopy('b','C')).rejects.toThrow('escrita falhou')
  await expect(updateLibrarySettings({loanDays:1,maxActiveLoans:1,maxRenewals:0,defaultCopies:2})).rejects.toThrow('escrita falhou')
})
