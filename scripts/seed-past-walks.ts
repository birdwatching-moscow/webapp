/**
 * Creates 5 past walks and tickets for polinasmekhova+2@gmail.com.
 * Run with: npx tsx scripts/seed-past-walks.ts
 * Requires DATABASE_URL env var (from .env.local or inline).
 */
import { PrismaClient, EventStatus, OrderStatus } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const EMAIL = 'polinasmekhova+2@gmail.com'

async function main() {
  let targetUser = await prisma.user.findFirst({
    where: { email: EMAIL, deletedAt: null },
    select: { id: true },
  })
  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: { email: EMAIL, name: 'Test User' },
      select: { id: true },
    })
    console.log(`Created test user ${EMAIL}`)
  }

  const guide = await prisma.teamMember.findFirst({ select: { id: true } })
  if (!guide) throw new Error('No team members found — run prisma seed first')

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  })
  if (!admin) throw new Error('No admin user found — run prisma seed first')

  const past = (daysAgo: number, startHour: number, durationHours: number) => {
    const start = new Date()
    start.setDate(start.getDate() - daysAgo)
    start.setHours(startHour, 0, 0, 0)
    const end = new Date(start)
    end.setHours(startHour + durationHours, 0, 0, 0)
    return { startsAt: start, endsAt: end }
  }

  const walks = [
    {
      slug: `past-izmaylovo-${Date.now()}-1`,
      title: 'Измайловский парк',
      description: 'Утренняя прогулка по Измайловскому парку.',
      ...past(90, 9, 4),
      location: 'Измайловский парк, главный вход',
      priceKopecks: 130000,
      capacity: 12,
    },
    {
      slug: `past-botanical-${Date.now()}-2`,
      title: 'Птицы Главного ботанического сада',
      description: 'Прогулка по ботаническому саду.',
      ...past(65, 9, 4),
      location: 'Главный ботанический сад, вход с проспекта Мира',
      priceKopecks: 150000,
      capacity: 10,
    },
    {
      slug: `past-troparyovo-${Date.now()}-3`,
      title: 'Птицы Тропарёвского заказника',
      description: 'Осенняя прогулка по Тропарёвскому лесопарку.',
      ...past(45, 9, 4),
      location: 'Тропарёвский лесопарк, вход с ул. Тропарёвская',
      priceKopecks: 120000,
      capacity: 10,
    },
    {
      slug: `past-tsaritsyno-${Date.now()}-4`,
      title: 'Птицы Царицыно',
      description: 'Прогулка по парку Царицыно.',
      ...past(30, 9, 4),
      location: 'Парк Царицыно, главный вход',
      priceKopecks: 130000,
      capacity: 12,
    },
    {
      slug: `past-tushino-${Date.now()}-5`,
      title: 'Птицы Тушинского леса',
      description: 'Прогулка по Тушинскому лесопарку.',
      ...past(14, 9, 4),
      location: 'Тушинский лесопарк',
      priceKopecks: 110000,
      capacity: 10,
    },
  ]

  for (const walkData of walks) {
    const walk = await prisma.walk.create({
      data: {
        ...walkData,
        guideId: guide.id,
        status: EventStatus.ACTIVE,
        coverPhotoUrl: 'https://placeholder.example.com/covers/past.jpg',
        publishedAt: new Date(),
        publishedBy: admin.id,
      },
    })

    const order = await prisma.order.create({
      data: {
        userId: targetUser.id,
        status: OrderStatus.PAID,
        totalKopecks: walk.priceKopecks,
        expiresAt: walk.startsAt,
        paidAt: walk.startsAt,
        orderItems: {
          create: { walkId: walk.id, quantity: 1, unitPriceKopecks: walk.priceKopecks },
        },
      },
    })

    await prisma.ticket.create({
      data: { orderId: order.id, userId: targetUser.id, walkId: walk.id },
    })

    console.log(`Created walk "${walk.title}" with ticket for ${EMAIL}`)
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
