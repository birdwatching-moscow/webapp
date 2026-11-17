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
  await prisma.ticketType.deleteMany()
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

  const buyer1 = await prisma.user.create({
    data: { email: 'anna.sorokina@example.com', name: 'Анна Сорокина', role: Role.USER },
  })
  const buyer2 = await prisma.user.create({
    data: { email: 'dmitry.volkov@example.com', name: 'Дмитрий Волков', role: Role.USER },
  })
  const buyer3 = await prisma.user.create({
    data: { email: 'elena.zhuravleva@example.com', name: 'Елена Журавлёва', role: Role.USER },
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
  const walk1 = await prisma.walk.create({
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
      ticketTypes: {
        create: [
          { name: 'Взрослый',  priceKopecks: 150000, capacity: 10, sortOrder: 0 },
          { name: 'Студентам', priceKopecks:  90000, capacity:  2, sortOrder: 1 },
        ],
      },
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
  const walk3 = await prisma.walk.create({
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
      ticketTypes: {
        create: [
          { name: 'Стандартный', priceKopecks: 130000, capacity: 10, sortOrder: 0 },
        ],
      },
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
          hasBinoculars: true,
        },
      },
    },
  })

  await prisma.ticket.createMany({
    data: Array.from({ length: soldOutWalk.capacity }, () => ({
      orderId: soldOutOrder.id,
      userId: admin.id,
      walkId: soldOutWalk.id,
      hasBinoculars: true,
    })),
  })

  // Walk 1: 3 tickets sold (2 adult + 1 student)
  const order1a = await prisma.order.create({
    data: {
      userId: buyer1.id,
      status: OrderStatus.PAID,
      totalKopecks: 150000 * 2,
      expiresAt: now,
      paidAt: now,
      orderItems: { create: { walkId: walk1.id, quantity: 2, unitPriceKopecks: 150000, hasBinoculars: true } },
    },
  })
  await prisma.ticket.createMany({
    data: [
      { orderId: order1a.id, userId: buyer1.id, walkId: walk1.id, hasBinoculars: true },
      { orderId: order1a.id, userId: buyer1.id, walkId: walk1.id, hasBinoculars: true },
    ],
  })

  const order1b = await prisma.order.create({
    data: {
      userId: buyer2.id,
      status: OrderStatus.PAID,
      totalKopecks: 90000,
      expiresAt: now,
      paidAt: now,
      orderItems: { create: { walkId: walk1.id, quantity: 1, unitPriceKopecks: 90000, hasBinoculars: false } },
    },
  })
  await prisma.ticket.create({ data: { orderId: order1b.id, userId: buyer2.id, walkId: walk1.id, hasBinoculars: false } })

  // Walk 3: 5 tickets sold across 3 buyers
  const order3a = await prisma.order.create({
    data: {
      userId: buyer1.id,
      status: OrderStatus.PAID,
      totalKopecks: 130000 * 2,
      expiresAt: now,
      paidAt: now,
      orderItems: { create: { walkId: walk3.id, quantity: 2, unitPriceKopecks: 130000, hasBinoculars: false } },
    },
  })
  await prisma.ticket.createMany({
    data: [
      { orderId: order3a.id, userId: buyer1.id, walkId: walk3.id, hasBinoculars: false },
      { orderId: order3a.id, userId: buyer1.id, walkId: walk3.id, hasBinoculars: false },
    ],
  })

  const order3b = await prisma.order.create({
    data: {
      userId: buyer2.id,
      status: OrderStatus.PAID,
      totalKopecks: 130000 * 2,
      expiresAt: now,
      paidAt: now,
      orderItems: { create: { walkId: walk3.id, quantity: 2, unitPriceKopecks: 130000, hasBinoculars: true } },
    },
  })
  await prisma.ticket.createMany({
    data: [
      { orderId: order3b.id, userId: buyer2.id, walkId: walk3.id, hasBinoculars: true },
      { orderId: order3b.id, userId: buyer2.id, walkId: walk3.id, hasBinoculars: true },
    ],
  })

  const order3c = await prisma.order.create({
    data: {
      userId: buyer3.id,
      status: OrderStatus.PAID,
      totalKopecks: 130000,
      expiresAt: now,
      paidAt: now,
      orderItems: { create: { walkId: walk3.id, quantity: 1, unitPriceKopecks: 130000, hasBinoculars: true } },
    },
  })
  await prisma.ticket.create({ data: { orderId: order3c.id, userId: buyer3.id, walkId: walk3.id, hasBinoculars: true } })

  const daysFromNow = (days: number) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 8, 0, 0)

  // PLACEHOLDER: expedition covers — replace with real S3 URLs
  const EXPEDITION_COVER = '/images/home-walks.jpg'

  await prisma.expedition.create({
    data: {
      slug: 'dagestan-gory-i-kaspiy',
      title: 'Дагестан: горы и каспийский берег',
      description: 'Восемь дней, смешанные биотопы, до двенадцати участников.',
      startsAt: daysFromNow(30),
      endsAt: daysFromNow(37),
      location: 'Республика Дагестан',
      totalSpots: 12,
      spotsLeft: 5,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: EXPEDITION_COVER,
      galleryUrls: [],
      publishedAt: now,
      publishedBy: admin.id,
      guides: { connect: [{ id: guide1.id }] },
    },
  })

  const expedition = await prisma.expedition.create({
    data: {
      slug: 'altay-orly-i-sokoly',
      title: 'Алтай: орлы и соколы',
      description:
        'Восьмидневная экспедиция в горный Алтай. Наблюдаем за беркутом, сапсаном и балобаном.',
      startsAt: daysFromNow(75),
      endsAt: daysFromNow(82),
      location: 'Республика Алтай, Чемальский район',
      totalSpots: 12,
      spotsLeft: 8,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: EXPEDITION_COVER,
      galleryUrls: [],
      publishedAt: now,
      publishedBy: admin.id,
      guides: { connect: [{ id: guide1.id }, { id: guide2.id }] },
    },
  })

  await prisma.expedition.create({
    data: {
      slug: 'kareliya-belye-nochi',
      title: 'Карелия: белые ночи и кулики',
      description: 'Шесть дней на озёрах и болотах, весенний пролёт куликов и гагар.',
      startsAt: daysFromNow(120),
      endsAt: daysFromNow(125),
      location: 'Республика Карелия',
      totalSpots: 10,
      spotsLeft: 10,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: EXPEDITION_COVER,
      galleryUrls: [],
      publishedAt: now,
      publishedBy: admin.id,
      guides: { connect: [{ id: guide2.id }] },
    },
  })

  await prisma.expedition.create({
    data: {
      slug: 'kamchatka-morskie-ptitsy',
      title: 'Камчатка: морские птицы и вулканы',
      description: 'Десять дней, птичьи базары Авачинской бухты, топорки и белоплечие орланы.',
      startsAt: daysFromNow(180),
      endsAt: daysFromNow(189),
      location: 'Камчатский край',
      totalSpots: 8,
      spotsLeft: 3,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: EXPEDITION_COVER,
      galleryUrls: [],
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
