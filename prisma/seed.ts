import { PrismaClient, EventStatus, OrderStatus, Role } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clear in FK-safe order so the script is safe to re-run
  await prisma.request.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.expeditionDay.deleteMany()
  await prisma.expedition.deleteMany()
  await prisma.walk.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.user.deleteMany()

  // PLACEHOLDER: admin user — replace passwordHash with a real bcrypt/argon2 hash before use
  const admin = await prisma.user.create({
    data: {
      email: 'admin@birdwatch.example.com',
      passwordHash: 'PLACEHOLDER_HASH_NOT_FOR_PRODUCTION',
      name: 'Администратор',
      role: Role.ADMIN,
    },
  })

  const now = new Date()
  const inOneMonth       = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(),      8,  0, 0)
  const inOneMonthEnd    = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(),     10,  0, 0)
  const inTwoMonths      = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate(),     19,  0, 0)
  const inTwoMonthsEnd   = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate(),     21,  0, 0)
  const inThreeWeeks     = new Date(now.getFullYear(), now.getMonth(),     now.getDate() + 21, 9,  0, 0)
  const inThreeWeeksEnd  = new Date(now.getFullYear(), now.getMonth(),     now.getDate() + 21,11,  0, 0)
  const inFiveWeeks      = new Date(now.getFullYear(), now.getMonth(),     now.getDate() + 35,10,  0, 0)
  const inFiveWeeksEnd   = new Date(now.getFullYear(), now.getMonth(),     now.getDate() + 35,12,  0, 0)
  const inTenWeeks       = new Date(now.getFullYear(), now.getMonth(),     now.getDate() + 70, 7,  0, 0)
  const inTenWeeksEnd    = new Date(now.getFullYear(), now.getMonth(),     now.getDate() + 70, 9, 30, 0)

  // PLACEHOLDER: guides — replace photoUrl with real S3 URLs
  const guide1 = await prisma.teamMember.create({
    data: {
      name: 'Иван Соколов',
      photoUrl: 'https://placeholder.example.com/photos/guide1.jpg',
      education: 'Кандидат биологических наук, МГУ им. Ломоносова. Специализация — орнитология Евразии.',
      achievements: 'Автор более 50 научных публикаций. Участник экспедиций в Алтай, Казахстан, Монголию.',
      profileLinks: ['https://orcid.org/0000-0000-0000-0001'],
      sortOrder: 0,
    },
  })

  const guide2 = await prisma.teamMember.create({
    data: {
      name: 'Мария Птичникова',
      photoUrl: 'https://placeholder.example.com/photos/guide2.jpg',
      education: 'Зоолог, специалист по водоплавающим и околоводным птицам.',
      achievements: 'Победитель фотоконкурса «Птица года» 2023.',
      profileLinks: [],
      sortOrder: 1,
    },
  })

  await prisma.teamMember.create({
    data: {
      name: 'Алексей Перов',
      photoUrl: 'https://placeholder.example.com/photos/guide3.jpg',
      education: null,
      achievements: null,
      profileLinks: ['https://www.researchgate.net/profile/placeholder'],
      sortOrder: 2,
    },
  })

  // PLACEHOLDER: walk 1 — replace coverPhotoUrl with real S3 URL
  await prisma.walk.create({
    data: {
      slug: 'utrenniy-berdvoching-pokrovskoe-streshnevo',
      title: 'Утренний бёрдвотчинг в Покровском-Стрешнево',
      description:
        'Прогулка по одному из лучших мест для наблюдения за птицами в Москве. Ожидаем встретить зябликов, дроздов, синиц, уток и крякв. Подходит для начинающих.',
      startsAt: inOneMonth,
      endsAt: inOneMonthEnd,
      location: 'Парк Покровское-Стрешнево, вход с ул. Вишнёвая',
      priceKopecks: 150000,
      capacity: 12,
      guideId: guide1.id,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: 'https://placeholder.example.com/covers/walk1.jpg',
      publishedAt: now,
      publishedBy: admin.id,
    },
  })

  // PLACEHOLDER: walk 2 — replace coverPhotoUrl with real S3 URL
  await prisma.walk.create({
    data: {
      slug: 'vecher-losiniy-ostrov',
      title: 'Вечерние птицы Лосиного острова',
      description:
        'Вечерняя прогулка по национальному парку. Лучшее время для наблюдения за дятлами, совами и ночными птицами. Берём фонарики.',
      startsAt: inTwoMonths,
      endsAt: inTwoMonthsEnd,
      location: 'Национальный парк «Лосиный остров», Погонный проезд, центральный вход',
      priceKopecks: 120000,
      capacity: 10,
      guideId: guide1.id,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: 'https://placeholder.example.com/covers/walk2.jpg',
      publishedAt: now,
      publishedBy: admin.id,
    },
  })

  // PLACEHOLDER: walk 3 — replace coverPhotoUrl with real S3 URL
  await prisma.walk.create({
    data: {
      slug: 'kolomenskoe-pervye-perelyotnye',
      title: 'Коломенское: первые перелётные',
      description:
        'Ранняя осенняя прогулка по склонам и пойме Москвы-реки. Наблюдаем за первыми осенними мигрантами: мухоловками, пеночками, зарянками.',
      startsAt: inThreeWeeks,
      endsAt: inThreeWeeksEnd,
      location: 'Музей-заповедник «Коломенское», главный вход',
      priceKopecks: 130000,
      capacity: 10,
      guideId: guide2.id,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: 'https://placeholder.example.com/covers/walk3.jpg',
      publishedAt: now,
      publishedBy: admin.id,
    },
  })

  // PLACEHOLDER: walk 4 — replace coverPhotoUrl with real S3 URL
  await prisma.walk.create({
    data: {
      slug: 'bitsevskiy-les-dyatly',
      title: 'Битцевский лес: дятлы и поползни',
      description:
        'Прогулка по старому смешанному лесу. Идеальное время для наблюдения за дятлами — большим пёстрым, малым пёстрым и чёрным — а также за поползнями и пищухами.',
      startsAt: inFiveWeeks,
      endsAt: inFiveWeeksEnd,
      location: 'Битцевский лес, вход со ст. м. Новоясеневская',
      priceKopecks: 110000,
      capacity: 12,
      guideId: guide1.id,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: 'https://placeholder.example.com/covers/walk4.jpg',
      publishedAt: now,
      publishedBy: admin.id,
    },
  })

  // Walk 5: sold out — capacity filled by real ticket records
  const soldOutWalk = await prisma.walk.create({
    data: {
      slug: 'fili-utki-i-nyrki',
      title: 'Фили: утки и нырки',
      description:
        'Осмотр зимующих водоплавающих птиц на Москве-реке в районе Филёвского парка. Ожидаем хохлатых чернетей, гоголей и крякв.',
      startsAt: inTenWeeks,
      endsAt: inTenWeeksEnd,
      location: 'Филёвский парк, лодочная станция',
      priceKopecks: 95000,
      capacity: 8,
      guideId: guide2.id,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: 'https://placeholder.example.com/covers/walk5.jpg',
      publishedAt: now,
      publishedBy: admin.id,
    },
  })

  // Create a paid order that fills all 8 spots on soldOutWalk
  const soldOutOrder = await prisma.order.create({
    data: {
      userId: admin.id,
      status: OrderStatus.PAID,
      totalKopecks: soldOutWalk.priceKopecks * soldOutWalk.capacity,
      expiresAt: now,
      paidAt: now,
      orderItems: {
        create: {
          walkId: soldOutWalk.id,
          quantity: soldOutWalk.capacity,
          unitPriceKopecks: soldOutWalk.priceKopecks,
        },
      },
    },
  })

  await prisma.ticket.createMany({
    data: Array.from({ length: soldOutWalk.capacity }, () => ({
      orderId: soldOutOrder.id,
      userId: admin.id,
      walkId: soldOutWalk.id,
    })),
  })

  // PLACEHOLDER: expedition — replace coverPhotoUrl with real S3 URL
  const expedition = await prisma.expedition.create({
    data: {
      slug: 'altay-2026',
      title: 'Алтай 2026: орлы и соколы',
      description:
        'Восьмидневная экспедиция в горный Алтай. Наблюдаем за хищными птицами: беркутом, сапсаном, балобаном. Маршрут рассчитан на людей с базовой физической подготовкой.',
      startsAt: new Date('2026-08-01T08:00:00+03:00'),
      location: 'Республика Алтай, Чемальский район',
      totalSpots: 12,
      spotsLeft: 8,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: 'https://placeholder.example.com/covers/expedition1.jpg',
      publishedAt: now,
      publishedBy: admin.id,
      guides: { connect: [{ id: guide1.id }, { id: guide2.id }] },
    },
  })

  await prisma.expeditionDay.createMany({
    data: [
      {
        expeditionId: expedition.id,
        dayNumber: 1,
        title: 'Прилёт и размещение',
        description: 'Прилетаем в Горно-Алтайск, трансфер в базовый лагерь. Знакомство с маршрутом и снаряжением.',
      },
      {
        expeditionId: expedition.id,
        dayNumber: 2,
        title: 'Первый выход на маршрут',
        description: 'Подъём на первый хребет. Наблюдение за гнездовьями беркута на скальных карнизах.',
      },
      {
        expeditionId: expedition.id,
        dayNumber: 3,
        title: 'Горные озёра',
        description: 'Переход к высокогорным озёрам. Встречаем гусей и крохалей, ищем следы сапсана.',
      },
      {
        expeditionId: expedition.id,
        dayNumber: 4,
        title: 'Фоторабота и дневёвка',
        description: 'Свободное время для съёмки. Лекция по идентификации хищных птиц в полёте.',
      },
      {
        expeditionId: expedition.id,
        dayNumber: 5,
        title: 'Перевал Кату-Ярык',
        description: 'Сложный ходовой день. Шанс увидеть балобана и кречета над ущельем.',
      },
      {
        expeditionId: expedition.id,
        dayNumber: 6,
        title: 'Долина Чулышман',
        description: 'Наблюдение за колонией стервятников. Вечерний костёр и разбор фотографий.',
      },
      {
        expeditionId: expedition.id,
        dayNumber: 7,
        title: 'Возвращение в базовый лагерь',
        description: 'Обратный переход. Сводный список видов экспедиции, итоговая лекция.',
      },
      {
        expeditionId: expedition.id,
        dayNumber: 8,
        title: 'Отлёт',
        description: 'Трансфер в аэропорт Горно-Алтайска.',
      },
    ],
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
