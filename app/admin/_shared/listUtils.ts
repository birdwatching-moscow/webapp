import { EventStatus } from '@/generated/prisma/client'

export type StatusKey = typeof EventStatus.ACTIVE | typeof EventStatus.DRAFT | typeof EventStatus.PAST | typeof EventStatus.CANCELLED

export const STATUS_INFO: Record<StatusKey, { label: string; cls: string }> = {
  ACTIVE:    { label: 'Активна',   cls: 'badgeACTIVE' },
  DRAFT:     { label: 'Черновик',  cls: 'badgeDRAFT' },
  PAST:      { label: 'Завершена', cls: 'badgePAST' },
  CANCELLED: { label: 'Отменена',  cls: 'badgeCANCELLED' },
}

export function getStatusInfo(status: string) {
  return STATUS_INFO[status as StatusKey] ?? { label: status, cls: 'badgeACTIVE' }
}

export type AllFilters = { q: string; from: string; to: string; statuses: string[]; guides: string[] }

export function filtersToSearchParams(filters: AllFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (filters.q) p.set('q', filters.q)
  if (filters.from) p.set('from', filters.from)
  if (filters.to) p.set('to', filters.to)
  filters.statuses.forEach(s => p.append('status', s))
  filters.guides.forEach(g => p.append('guide', g))
  return p
}

export function getPageSlots(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const slots: (number | null)[] = [1]
  if (current > 4) slots.push(null)

  const start = Math.max(2, current - 2)
  const end = Math.min(total - 1, current + 2)
  for (let i = start; i <= end; i++) slots.push(i)

  if (current < total - 3) slots.push(null)
  slots.push(total)

  return slots
}
