export type Guide = { id: number; name: string }

export type TicketTypeRow = {
  key: string
  name: string
  priceRub: string
  capacity: string
}

export function makeKey(): string {
  return Math.random().toString(36).slice(2)
}

export const MAX_TICKETS = 5
