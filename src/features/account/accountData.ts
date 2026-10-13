export const loans = [
  { bookId: 'pedagogia-da-autonomia', copy: 'PA-001', borrowed: '21/09/2026', due: '05/10/2026', status: '3 dias em atraso', tone: 'danger' },
  { bookId: 'dom-casmurro', copy: 'DC-004', borrowed: '29/09/2026', due: '13/10/2026', status: 'Vence em 5 dias', tone: 'warning' },
] as const

export const loanHistory = [
  { bookId: 'a-hora-da-estrela', copy: 'HE-001', borrowed: '10/09/2026', returned: '24/09/2026' },
  { bookId: 'capitaes-da-areia', copy: 'CA-001', borrowed: '18/09/2026', returned: '01/10/2026' },
] as const

export const reservations = [
  { bookId: 'design-do-dia-a-dia', id: 'R-003', requested: '30/09/2026', detail: 'Retirada até 09/10/2026', status: 'Pronta para retirada', tone: 'success' },
  { bookId: 'o-cortico', id: 'R-002', requested: '02/10/2026', detail: '2ª posição na fila', status: 'Pendente', tone: 'warning' },
] as const

export const readingProgress = [
  { bookId: 'dom-casmurro', current: 120, total: 256, status: 'Lendo' },
  { bookId: 'pedagogia-da-autonomia', current: 60, total: 144, status: 'Lendo' },
  { bookId: 'quarto-de-despejo', current: 0, total: 180, status: 'Quero ler' },
  { bookId: 'codigo-limpo', current: 0, total: 464, status: 'Quero ler' },
  { bookId: 'a-hora-da-estrela', current: 87, total: 87, status: 'Concluído' },
] as const
