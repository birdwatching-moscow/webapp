import bcrypt from 'bcryptjs'
import { PrismaClient, EventStatus, Role } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// Dev password — change before logging in if desired, must be ≥ 16 chars
const DEV_PASSWORD = 'devseedpassword1'

async function main() {
  // Clear in FK-safe order so the script is safe to re-run
  await prisma.request.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.expeditionTicketType.deleteMany()
  await prisma.ticketType.deleteMany()
  await prisma.expeditionDay.deleteMany()
  await prisma.expedition.deleteMany()
  await prisma.walk.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.adminLoginChallenge.deleteMany()
  await prisma.loginCode.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10)

  const admin = await prisma.user.create({
    data: {
      email: 'polinasmekhova@gmail.com',
      passwordHash,
      name: 'Полина Смехова',
      role: Role.ADMIN,
    },
  })

  const guide = await prisma.teamMember.create({
    data: {
      name: 'Иван Соколов',
      photoUrl: 'https://placeholder.example.com/photos/guide.jpg',
      education: 'Кандидат биологических наук, МГУ. Специализация — орнитология Евразии.',
      achievements: 'Автор более 50 научных публикаций. Экспедиции в Алтай, Казахстан, Монголию.',
      profileLinks: ['https://orcid.org/0000-0000-0000-0001'],
      sortOrder: 0,
    },
  })

  const now = new Date()
  const dt = (days: number, hour = 8, minute = 0) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, hour, minute, 0)

  // ─── Прогулки ───────────────────────────────────────────

  await prisma.walk.create({
    data: {
      slug: 'utrenniy-berdvoching-pokrovskoe-streshnevo',
      title: 'Утренний бёрдвотчинг в Покровском-Стрешнево',
      description:
        'Прогулка по одному из лучших мест для наблюдения за птицами в Москве. Ожидаем встретить зябликов, дроздов, синиц и уток. Подходит для начинающих.',
      startsAt: dt(14, 8),
      endsAt:   dt(14, 10),
      location: 'Парк Покровское-Стрешнево, вход с ул. Вишнёвая',
      priceKopecks: 150000,
      capacity: 12,
      guideId: guide.id,
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

  await prisma.walk.create({
    data: {
      slug: 'vecher-losiniy-ostrov',
      title: 'Вечерние птицы Лосиного острова',
      description:
        'Вечерняя прогулка по национальному парку. Лучшее время для наблюдения за дятлами, совами и ночными птицами.',
      startsAt: dt(28, 19),
      endsAt:   dt(28, 21),
      location: 'Национальный парк «Лосиный остров», Погонный проезд, центральный вход',
      priceKopecks: 120000,
      capacity: 10,
      guideId: guide.id,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: 'https://placeholder.example.com/covers/walk2.jpg',
      publishedAt: now,
      publishedBy: admin.id,
      ticketTypes: {
        create: [
          { name: 'Стандартный', priceKopecks: 120000, capacity: 10, sortOrder: 0 },
        ],
      },
    },
  })

  await prisma.walk.create({
    data: {
      slug: 'kolomenskoe-pervye-perelyotnye',
      title: 'Коломенское: первые перелётные',
      description:
        'Прогулка по склонам и пойме Москвы-реки. Наблюдаем за осенними мигрантами: мухоловками, пеночками, зарянками.',
      startsAt: dt(42, 9),
      endsAt:   dt(42, 11),
      location: 'Музей-заповедник «Коломенское», главный вход',
      priceKopecks: 130000,
      capacity: 10,
      guideId: guide.id,
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

  await prisma.walk.create({
    data: {
      slug: 'bitsevskiy-les-dyatly',
      title: 'Битцевский лес: дятлы и поползни',
      description:
        'Прогулка по старому смешанному лесу. Идеальное время для наблюдения за большим, малым и чёрным дятлами, а также за поползнями и пищухами.',
      startsAt: dt(56, 10),
      endsAt:   dt(56, 12),
      location: 'Битцевский лес, вход со ст. м. Новоясеневская',
      priceKopecks: 110000,
      capacity: 12,
      guideId: guide.id,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: 'https://placeholder.example.com/covers/walk4.jpg',
      publishedAt: now,
      publishedBy: admin.id,
      ticketTypes: {
        create: [
          { name: 'Стандартный', priceKopecks: 110000, capacity: 12, sortOrder: 0 },
        ],
      },
    },
  })

  // ─── Экспедиции ──────────────────────────────────────────

  const COVER = 'https://placeholder.example.com/covers/expedition.jpg'

  await prisma.expedition.create({
    data: {
      slug: 'dagestan-gory-i-kaspiy',
      title: 'Дагестан: горы и каспийский берег',
      description: 'Восемь дней, смешанные биотопы от высокогорья до морского побережья, до двенадцати участников.',
      startsAt:    dt(30, 8),
      endsAt:      dt(37, 20),
      durationDays: 8,
      totalSpots: 12,
      spotsLeft:  12,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: COVER,
      aboutTitle: 'Экспедиция в горный Дагестан',
      aboutText: 'Дагестан — один из самых биоразнообразных регионов России. За восемь дней мы охватим сразу несколько биотопов: субальпийские луга, скальные обрывы, долины рек и Каспийское побережье.',
      difficulty: 4,
      galleryItems: [],
      checklistItems: [],
      includedItems: ['Трансфер по маршруту', 'Проживание', 'Питание'],
      excludedItems: ['Авиаперелёт до Махачкалы', 'Личное снаряжение'],
      publishedAt: now,
      publishedBy: admin.id,
      guides: { connect: [{ id: guide.id }] },
      ticketTypes: {
        create: [{ name: 'Стандартный', priceKopecks: 8500000, capacity: 12, sortOrder: 0 }],
      },
      days: {
        create: [
          { dayNumber: 1, title: 'Прилёт и заселение',        description: 'Встреча в аэропорту Махачкалы, трансфер в горное село, знакомство с маршрутом.' },
          { dayNumber: 2, title: 'Субальпийские луга',         description: 'Первый выход. Наблюдение за горными трясогузками, краснокрылыми стенолазами.' },
          { dayNumber: 3, title: 'Скальные обрывы',            description: 'Колонии стрижей и сипов. Поиск кавказского тетерева.' },
          { dayNumber: 4, title: 'Долина реки Самур',          description: 'Лиановый лес — реликтовое широколиственное сообщество, богатейшая авиафауна.' },
          { dayNumber: 5, title: 'Каспийское побережье',       description: 'Пролётные кулики и утки, встречаем фламинго и пеликанов.' },
          { dayNumber: 6, title: 'Возвращение в горы',         description: 'Переход на высокогорное плато. Поиск улара.' },
          { dayNumber: 7, title: 'Фоторабота и дневёвка',      description: 'Свободное время для съёмки, итоговая лекция по идентификации.' },
          { dayNumber: 8, title: 'Отлёт',                      description: 'Трансфер в аэропорт Махачкалы.' },
        ],
      },
    },
  })

  await prisma.expedition.create({
    data: {
      slug: 'altay-orly-i-sokoly',
      title: 'Алтай: орлы и соколы',
      description: 'Восемь дней в горном Алтае. Беркут, сапсан и балобан над ущельями Чулышмана.',
      startsAt:    dt(75, 8),
      endsAt:      dt(82, 20),
      durationDays: 8,
      totalSpots: 10,
      spotsLeft:  10,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: COVER,
      aboutTitle: 'Охотники за высотой',
      aboutText: 'Алтай — территория крупных хищных птиц. Мы будем искать беркута на скальных карнизах, сапсана над перевалами и редкого балобана в долинах.',
      difficulty: 6,
      galleryItems: [],
      checklistItems: [],
      includedItems: ['Трансфер по маршруту', 'Проживание', 'Питание'],
      excludedItems: ['Авиаперелёт до Горно-Алтайска', 'Личное снаряжение'],
      publishedAt: now,
      publishedBy: admin.id,
      guides: { connect: [{ id: guide.id }] },
      ticketTypes: {
        create: [{ name: 'Стандартный', priceKopecks: 9500000, capacity: 10, sortOrder: 0 }],
      },
      days: {
        create: [
          { dayNumber: 1, title: 'Прилёт и размещение',        description: 'Трансфер из Горно-Алтайска в базовый лагерь, знакомство.' },
          { dayNumber: 2, title: 'Первый хребет',              description: 'Подъём на первый хребет. Гнездовья беркута на скальных карнизах.' },
          { dayNumber: 3, title: 'Горные озёра',               description: 'Гуси и крохали на высокогорных озёрах, поиск сапсана.' },
          { dayNumber: 4, title: 'Фоторабота и дневёвка',      description: 'Свободное время для съёмки. Лекция по хищным птицам.' },
          { dayNumber: 5, title: 'Перевал Кату-Ярык',          description: 'Сложный ходовой день. Шанс увидеть балобана над ущельем.' },
          { dayNumber: 6, title: 'Долина Чулышман',            description: 'Колония стервятников, вечерний разбор фотографий.' },
          { dayNumber: 7, title: 'Возвращение в базовый лагерь', description: 'Обратный переход, сводный список видов, итоговая лекция.' },
          { dayNumber: 8, title: 'Отлёт',                      description: 'Трансфер в аэропорт Горно-Алтайска.' },
        ],
      },
    },
  })

  await prisma.expedition.create({
    data: {
      slug: 'kareliya-belye-nochi',
      title: 'Карелия: белые ночи и кулики',
      description: 'Шесть дней на озёрах и болотах, весенний пролёт куликов и гагар.',
      startsAt:    dt(120, 8),
      endsAt:      dt(125, 20),
      durationDays: 6,
      totalSpots: 10,
      spotsLeft:  10,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: COVER,
      aboutTitle: 'Птицы белых ночей',
      aboutText: 'Карелия в период белых ночей — фантастическое место для наблюдения за куликами и гагарами. Непрерывный световой день позволяет работать в поле с рассвета до заката.',
      difficulty: 3,
      galleryItems: [],
      checklistItems: [],
      includedItems: ['Трансфер по маршруту', 'Проживание', 'Питание', 'Лодки'],
      excludedItems: ['Поезд до Петрозаводска', 'Личное снаряжение'],
      publishedAt: now,
      publishedBy: admin.id,
      guides: { connect: [{ id: guide.id }] },
      ticketTypes: {
        create: [{ name: 'Стандартный', priceKopecks: 7200000, capacity: 10, sortOrder: 0 }],
      },
      days: {
        create: [
          { dayNumber: 1, title: 'Прибытие',                   description: 'Трансфер из Петрозаводска, размещение на базе.' },
          { dayNumber: 2, title: 'Болота и кулики',            description: 'Первый выход на болото. Дупель, бекас, большой кроншнеп.' },
          { dayNumber: 3, title: 'Озёрные гагары',             description: 'Лодочный выход на озёра. Чернозобая и краснозобая гагары.' },
          { dayNumber: 4, title: 'Лесные птицы',               description: 'Мохнатый сыч, желна, трёхпалый дятел в сосновом бору.' },
          { dayNumber: 5, title: 'Итоговый выход',             description: 'Дополнительный шанс записать пропущенные виды.' },
          { dayNumber: 6, title: 'Отъезд',                     description: 'Трансфер в Петрозаводск.' },
        ],
      },
    },
  })

  await prisma.expedition.create({
    data: {
      slug: 'kamchatka-morskie-ptitsy',
      title: 'Камчатка: морские птицы и вулканы',
      description: 'Десять дней на краю света. Птичьи базары Авачинской бухты, топорки и белоплечие орланы.',
      startsAt:    dt(180, 8),
      endsAt:      dt(189, 20),
      durationDays: 10,
      totalSpots: 8,
      spotsLeft:  8,
      status: EventStatus.ACTIVE,
      coverPhotoUrl: COVER,
      aboutTitle: 'Край земли — край птиц',
      aboutText: 'Камчатка — одно из самых богатых орнитологических мест на планете. Мы выйдем на катере в Авачинскую бухту к птичьим базарам и пройдём вдоль вулканов.',
      difficulty: 5,
      galleryItems: [],
      checklistItems: [],
      includedItems: ['Трансфер по маршруту', 'Проживание', 'Питание', 'Выходы на катере'],
      excludedItems: ['Авиаперелёт до Петропавловска-Камчатского', 'Личное снаряжение'],
      publishedAt: now,
      publishedBy: admin.id,
      guides: { connect: [{ id: guide.id }] },
      ticketTypes: {
        create: [{ name: 'Стандартный', priceKopecks: 15000000, capacity: 8, sortOrder: 0 }],
      },
      days: {
        create: [
          { dayNumber: 1,  title: 'Прилёт и заселение',        description: 'Встреча в Петропавловске, переезд на базу.' },
          { dayNumber: 2,  title: 'Авачинская бухта',          description: 'Первый морской выход. Топорки, тупики, конюги.' },
          { dayNumber: 3,  title: 'Птичий базар на Трёх Братьях', description: 'Скалы с колонией кайр и моевок.' },
          { dayNumber: 4,  title: 'Внутренние водоёмы',        description: 'Лебеди, гуси, утки на озёрах Налычево.' },
          { dayNumber: 5,  title: 'Вулканическое плато',       description: 'Поход к подножию Авачинского. Горные коньки, лапландский подорожник.' },
          { dayNumber: 6,  title: 'Второй морской выход',      description: 'Поиск белоплечего орлана над акваторией.' },
          { dayNumber: 7,  title: 'Дальние кошки',             description: 'Лодочный выход к отдалённым скалам с крупнейшим базаром.' },
          { dayNumber: 8,  title: 'Фоторабота и дневёвка',     description: 'Свободное время, лекция по морским птицам Тихого океана.' },
          { dayNumber: 9,  title: 'Итоговый маршрут',          description: 'Последний выход, сводный список, сборы.' },
          { dayNumber: 10, title: 'Отлёт',                     description: 'Трансфер в аэропорт Петропавловска-Камчатского.' },
        ],
      },
    },
  })

  console.log('✓ Seed complete.')
  console.log(`  Admin: polinasmekhova@gmail.com / ${DEV_PASSWORD}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
