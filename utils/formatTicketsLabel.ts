import { pluralRu } from '@/utils/pluralRu'

export function formatTicketsLabel(available: number): string {
  if (available === 0) return 'нет билетов'
  return pluralRu(available, ['билет', 'билета', 'билетов'])
}
