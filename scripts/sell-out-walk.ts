import { PrismaClient, OrderStatus } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const SLUG = 'bitsevskiy-les-dyatly'

async function main() {
  const walk = await prisma.walk.findUniqueOrThrow({
    where: { slug: SLUG },
    select: { id: true, slug: true, capacity: true, priceKopecks: true, _count: { select: { tickets: true } } },
  })

  const sold = walk._count.tickets
  const remaining = walk.capacity - sold

  if (remaining <= 0) {
    console.log(`Walk "${SLUG}" is already sold out (${sold}/${walk.capacity} tickets sold).`)
    return
  }

  const admin = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' }, select: { id: true } })

  const now = new Date()
  const order = await prisma.order.create({
    data: {
      userId: admin.id,
      status: OrderStatus.PAID,
      totalKopecks: walk.priceKopecks * remaining,
      expiresAt: now,
      paidAt: now,
      orderItems: {
        create: { walkId: walk.id, quantity: remaining, unitPriceKopecks: walk.priceKopecks },
      },
    },
  })

  await prisma.ticket.createMany({
    data: Array.from({ length: remaining }, () => ({
      orderId: order.id,
      userId: admin.id,
      walkId: walk.id,
    })),
  })

  console.log(`Sold out "${SLUG}": created ${remaining} tickets (${sold + remaining}/${walk.capacity}).`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
