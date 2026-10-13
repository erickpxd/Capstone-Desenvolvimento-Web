export type AdminStatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface AdminBookRow {
  title: string
  author: string
  isbn: string
  copies: number
  available: number
}

export const adminBooks: AdminBookRow[] = [
  { title: 'Dom Casmurro', author: 'Machado de Assis', isbn: '978-85-359-0277-8', copies: 4, available: 2 },
  { title: 'O Cortiço', author: 'Aluísio Azevedo', isbn: '978-85-359-0753-7', copies: 3, available: 1 },
  { title: 'A Hora da Estrela', author: 'Clarice Lispector', isbn: '978-85-359-1484-9', copies: 2, available: 0 },
  { title: 'Capitães da Areia', author: 'Jorge Amado', isbn: '978-85-359-0275-4', copies: 5, available: 2 },
  { title: 'Quarto de despejo', author: 'Carolina Maria de Jesus', isbn: '978-85-359-1830-4', copies: 3, available: 1 },
  { title: 'Pedagogia da autonomia', author: 'Paulo Freire', isbn: '978-85-249-2420-3', copies: 3, available: 1 },
  { title: 'O design do dia a dia', author: 'Donald Norman', isbn: '978-85-7522-517-0', copies: 2, available: 1 },
]

export const copyRows = [
  ['DC-001', 'Dom Casmurro', 'Disponível', 'Biblioteca central'],
  ['DC-004', 'Dom Casmurro', 'Emprestado', 'Ana Martins'],
  ['PA-001', 'Pedagogia da autonomia', 'Em atraso', 'Ana Martins'],
  ['DD-001', 'O design do dia a dia', 'Reservado', 'Carla Souza'],
  ['MP-001', 'Memórias póstumas de Brás Cubas', 'Manutenção', 'Biblioteca central'],
  ['MP-002', 'Memórias póstumas de Brás Cubas', 'Perdido', '—'],
] as const

export const loanRows = [
  ['EMP-1041', 'Ana Martins', 'Pedagogia da autonomia', '05/10/2026', 'Em atraso'],
  ['EMP-1040', 'Bruno Lima', 'Dom Casmurro', '14/10/2026', 'Em dia'],
  ['EMP-1039', 'Carla Souza', 'Capitães da Areia', '17/10/2026', 'Em dia'],
  ['EMP-1038', 'Diego Santos', 'O Cortiço', '20/10/2026', 'Em dia'],
] as const

export const students = [
  ['202600184', 'Ana Martins', 'ana.martins@universidade.edu.br', 'Biblioteconomia', 'Ativa'],
  ['202600217', 'Bruno Lima', 'bruno.lima@universidade.edu.br', 'História', 'Ativa'],
  ['202600301', 'Carla Souza', 'carla.souza@universidade.edu.br', 'Design', 'Ativa'],
  ['202600445', 'Diego Santos', 'diego.santos@universidade.edu.br', 'Letras', 'Suspensa'],
] as const

export const activityRows = [
  ['Empréstimo registrado', 'Bruno Lima · Dom Casmurro', 'Hoje, 09:42'],
  ['Reserva disponível', 'Carla Souza · O design do dia a dia', 'Hoje, 08:15'],
  ['Exemplar devolvido', 'Marina Costa · O Cortiço', 'Ontem, 17:31'],
  ['Novo estudante', 'Rafael Alves · Engenharia', 'Ontem, 15:08'],
] as const

export function toneForStatus(status: string): AdminStatusTone {
  if (['Disponível', 'Em dia', 'Ativa', 'Concluída', 'Retirada'].includes(status)) return 'success'
  if (['Em atraso', 'Perdido', 'Suspensa', 'Cancelada'].includes(status)) return 'danger'
  if (['Reservado', 'Pronta para retirada'].includes(status)) return 'info'
  if (['Manutenção', 'Aguardando'].includes(status)) return 'warning'
  return 'neutral'
}
