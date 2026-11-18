import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rateLimit'
import { createPayment } from '@/lib/payments/yookassa'
import { kopecksToString } from '@/lib/payments/money'
import { buildReceipt, truncateDescription } from '@/lib/payments/receipt'
import { env } from '@/lib/env'
import { validateRequest } from '@/lib/api/validate'
import {
  PAYMENT_HOLD_MINUTES,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_TOO_MANY_REQUESTS,
  HTTP_STATUS_BAD_GATEWAY,
} from '@/lib/constants'
import type { Prisma } from '@/generated/prisma/client'
import { CHECKOUT_ERROR_CODE } from '@/types/checkout'
import type { CheckoutErrorCode, WalkSnapshot, CreatedOrder, OrderLineItem } from '@/types/checkout'

const MS_PER_MINUTE = 60 * 1000

const lineItemSchema = z.object({
  ticketTypeId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
})

const checkoutBodySchema = z
  .object({
    walkId: z.string().uuid(),
    hasBinoculars: z.boolean().optional().default(false),
    quantity: z.number().int().min(1).max(10).optional(),
    lineItems: z.array(lineItemSchema).min(1).max(5).optional(),
  })
  .refine(
    (d) => d.quantity !== undefined || (d.lineItems && d.lineItems.length > 0),
    { message: 'Provide quantity or lineItems' }
  )

// NOTE: dynamic import so module resolution is deferred until the handler runs —
// required for the mocked '@/lib/prisma' module to resolve correctly in tests.
async function getPrisma() {
  return (await import('@/lib/prisma')).prisma
}

class CheckoutError extends Error {
  constructor(
    public readonly code: CheckoutErrorCode,
    public readonly status: number
  ) {
    super(code)
  }
}

async function createPendingOrder(
  userId: string,
  walkId: string,
  quantity: number,
  hasBinoculars: boolean
): Promise<{ order: CreatedOrder; lineItems: OrderLineItem[] }> {
  const prisma = await getPrisma()
  return prisma.$transaction(async (tx) => {
    const now = new Date()

    // Lock walk row before reading to prevent double-booking under concurrent checkouts.
    await tx.$executeRaw`SELECT id FROM "Walk" WHERE id = ${walkId} FOR UPDATE`

    const [walk] = (await tx.walk.findMany({ where: { id: walkId } })) as WalkSnapshot[]

    const [soldCount, activeOrderItems] = await Promise.all([
      tx.ticket.count({ where: { walkId } }),
      tx.orderItem.findMany({
        where: { walkId, order: { status: 'AWAITING_PAYMENT', expiresAt: { gt: now } } },
      }),
    ])

    const orderSeats = activeOrderItems.reduce((sum, item) => sum + item.quantity, 0)
    if (soldCount + orderSeats + quantity > walk.capacity) {
      throw new CheckoutError(CHECKOUT_ERROR_CODE.capacityExceeded, HTTP_STATUS_CONFLICT)
    }

    const totalKopecks = walk.priceKopecks * quantity
    const expiresAt = new Date(now.getTime() + PAYMENT_HOLD_MINUTES * MS_PER_MINUTE)

    const order = await tx.order.create({
      data: {
        userId,
        status: 'PENDING',
        totalKopecks,
        expiresAt,
        orderItems: {
          create: [{ walkId, quantity, unitPriceKopecks: walk.priceKopecks, hasBinoculars }],
        },
      } satisfies Prisma.OrderUncheckedCreateInput,
    })

    const lineItems: OrderLineItem[] = [
      {
        walkId,
        title: walk.title,
        quantity,
        unitPriceKopecks: walk.priceKopecks,
      },
    ]

    return { order: order as CreatedOrder, lineItems }
  })
}

async function createPendingOrderMultiType(
  userId: string,
  walkId: string,
  lineItems: { ticketTypeId: number; quantity: number }[],
  hasBinoculars: boolean,
): Promise<{ order: CreatedOrder; lineItems: OrderLineItem[] }> {
  const prisma = await getPrisma()
  return prisma.$transaction(async (tx) => {
    const now = new Date()

    await tx.$executeRaw`SELECT id FROM "Walk" WHERE id = ${walkId} FOR UPDATE`

    const [walk] = (await tx.walk.findMany({ where: { id: walkId } })) as WalkSnapshot[]

    const ticketTypes = await tx.ticketType.findMany({
      where: { id: { in: lineItems.map((li) => li.ticketTypeId) }, walkId },
    })
    if (ticketTypes.length !== lineItems.length) {
      throw new CheckoutError('INVALID_TICKET_TYPE', 400)
    }

    const [soldCount, activeOrderItems] = await Promise.all([
      tx.ticket.count({ where: { walkId } }),
      tx.orderItem.findMany({
        where: { walkId, order: { status: 'AWAITING_PAYMENT', expiresAt: { gt: now } } },
      }),
    ])

    const totalQty = lineItems.reduce((sum, li) => sum + li.quantity, 0)
    const orderSeats = activeOrderItems.reduce((sum, item) => sum + item.quantity, 0)
    if (soldCount + orderSeats + totalQty > walk.capacity) {
      throw new CheckoutError(CHECKOUT_ERROR_CODE.capacityExceeded, HTTP_STATUS_CONFLICT)
    }

    const resolvedItems = lineItems.map((li) => {
      const type = ticketTypes.find((t) => t.id === li.ticketTypeId)!
      return {
        walkId,
        quantity: li.quantity,
        unitPriceKopecks: (type.priceKopecks ?? walk.priceKopecks),
        hasBinoculars,
        typeName: type.name,
      }
    })

    const totalKopecks = resolvedItems.reduce((sum, item) => sum + item.unitPriceKopecks * item.quantity, 0)
    const expiresAt = new Date(now.getTime() + PAYMENT_HOLD_MINUTES * MS_PER_MINUTE)

    const order = await tx.order.create({
      data: {
        userId,
        status: 'PENDING',
        totalKopecks,
        expiresAt,
        orderItems: {
          create: resolvedItems.map(({ typeName: _n, ...item }) => item),
        },
      } satisfies Prisma.OrderUncheckedCreateInput,
    })

    const orderLineItems: OrderLineItem[] = resolvedItems.map((item) => ({
      walkId,
      title: `${walk.title} – ${item.typeName}`,
      quantity: item.quantity,
      unitPriceKopecks: item.unitPriceKopecks,
    }))

    return { order: order as CreatedOrder, lineItems: orderLineItems }
  })
}

async function markAwaitingPayment(orderId: string, paymentId: string): Promise<void> {
  const prisma = await getPrisma()
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'AWAITING_PAYMENT', yooKassaPaymentId: paymentId },
    })
  })
}

function buildDescription(orderId: string, lineItems: OrderLineItem[]): string {
  const shortId = orderId.slice(0, 8)
  const titles = [...new Set(lineItems.map((item) => item.title))].join(', ')
  return truncateDescription(`Заказ ${shortId}: ${titles}`)
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS_UNAUTHORIZED })
  }

  const rateLimit = await checkRateLimit(userId, 'checkout')
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: HTTP_STATUS_TOO_MANY_REQUESTS, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const parsed = await validateRequest(req, checkoutBodySchema)
  if (!parsed.success) return parsed.response

  const { walkId, quantity, lineItems: reqLineItems, hasBinoculars } = parsed.data

  let order: CreatedOrder
  let lineItems: OrderLineItem[]
  try {
    if (reqLineItems && reqLineItems.length > 0) {
      ;({ order, lineItems } = await createPendingOrderMultiType(userId, walkId, reqLineItems, hasBinoculars))
    } else {
      ;({ order, lineItems } = await createPendingOrder(userId, walkId, quantity!, hasBinoculars))
    }
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ code: error.code }, { status: error.status })
    }
    throw error
  }

  try {
    const buyerEmail = session.user.email ?? ''
    const receipt = env.YOOKASSA_RECEIPT_ENABLED
      ? buildReceipt({
          customerEmail: buyerEmail,
          vatCode: env.YOOKASSA_VAT_CODE ?? '',
          totalKopecks: order.totalKopecks,
          items: lineItems.map((item) => ({
            description: item.title,
            quantity: item.quantity,
            unitPriceKopecks: item.unitPriceKopecks,
          })),
        })
      : undefined

    const paymentResult = await createPayment({
      idempotenceKey: order.id,
      amount: { value: kopecksToString(order.totalKopecks), currency: 'RUB' },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: `${env.APP_URL}/checkout/return?orderId=${order.id}`,
      },
      description: buildDescription(order.id, lineItems),
      metadata: { orderId: order.id },
      receipt,
    })

    await markAwaitingPayment(order.id, paymentResult.id)

    return NextResponse.json({ orderId: order.id, confirmationUrl: paymentResult.confirmationUrl })
  } catch (error) {
    console.error('[checkout] ЮKassa create payment failed', error)
    return NextResponse.json({ code: 'PAYMENT_PROVIDER_UNAVAILABLE' }, { status: HTTP_STATUS_BAD_GATEWAY })
  }
}
