export type CheckoutErrorCode = 'CAPACITY_EXCEEDED' | 'INVALID_TICKET_TYPE'

export const CHECKOUT_ERROR_CODE = {
  capacityExceeded:   'CAPACITY_EXCEEDED',
  invalidTicketType:  'INVALID_TICKET_TYPE',
} as const satisfies Record<string, CheckoutErrorCode>

export interface WalkSnapshot {
  id: string
  title: string
  priceKopecks: number
  capacity: number
}

export interface CreatedOrder {
  id: string
  totalKopecks: number
}

export interface OrderLineItem {
  walkId: string
  title: string
  quantity: number
  unitPriceKopecks: number
}
