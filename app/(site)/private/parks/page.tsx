import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/PageHero/PageHero'
import { PrivateLocations } from '@/components/private/PrivateLocations'
import { PrivateHighlights, type PrivateHighlight } from '@/components/private/PrivateHighlights'
import { PrivatePricing, PRICE_SECTION_ID } from '@/components/private/PrivatePricing'
import { PRIVATE_PARKS } from '@/lib/private/parks'
import { ROUTES } from '@/utils/routes'
import styles from './parks.module.css'

const TITLE = 'Парки Москвы и окрестностей'

export const metadata: Metadata = {
  title: `${TITLE} | Birdwatching Moscow`,
  description: 'Примеры локаций для персональных прогулок с гидом Birdwatching Moscow: парки Москвы и Подмосковья.',
}

const HIGHLIGHTS: readonly PrivateHighlight[] = [
  {
    title: 'Птицы не гарантированы',
    description:
      'Наблюдения за птицами имеют ярко выраженную сезонность; от времени года и даже месяца количество птиц отличается и некоторые локации подходят для наблюдений круглый год, некоторые - в определенный сезон.',
  },
  {
    title: 'Прошлые прогулки',
    description: (
      <>
        Чтобы получить большее представление о локациях и птицах, посмотрите{' '}
        <Link href={ROUTES.media} className="text-link">альбомы</Link>
        {' '}с фотографиями, сделанными во время наших событий
      </>
    ),
  },
  {
    title: 'Что взять с собой',
    description: 'Бинокль или фотоаппарат, воду и удобную обувь для прогулки. На длительные прогулки берите воду и перекусы.',
  },
  {
    title: 'Одежда по погоде',
    description:
      'Обувь, которую не жалко промочить, желательно непромокаемую, для некоторых локаций весной нужны резиновые сапоги длиной до колена, а для Виноградово - выше колена',
  },
  {
    title: 'Место встречи',
    description: 'Точная точка встречи указана в письме после покупки.',
  },
]

const PRICES = [
  { label: 'группа до 5 человек', price: '7 000 ₽' },
  { label: 'группа до 14 человек', price: '10 000 ₽' },
] as const

const TERMS =
  'После согласования всех деталей прогулки, гид за вами бронируется на 48 часов для оплаты (переводом на карту Тинькофф); если до начала прогулки осталось менее 48 часов, оплата потребуется в течение 5 часов. При отказе от события за 48 часов до начала мы вернем вам всю сумму, за вычетом 25%; при отказе менее, чем за 24 часа, средства не возвращаются. Если ваша группа более 14 человек, их нужно разбивать на несколько; в этом случае гид или проведет 2 прогулки подряд, или понадобятся 2 гида.'

export default function PrivateParksPage() {
  return (
    <main className={`container ${styles.page}`}>
      <PageHero
        title={TITLE}
        description="Примеры локации для персональных прогулок с гидом Birdwatching Moscow."
        cta={{ label: 'Посмотреть стоимость', href: `#${PRICE_SECTION_ID}` }}
      />
      <PrivateLocations
        title="Примеры локаций"
        description="Список не исчерпывающий; если вы хотите прогулку в локации, которой нет в списке, напишите нам!"
        locations={PRIVATE_PARKS}
      />
      <PrivateHighlights
        title="Важно знать"
        highlights={HIGHLIGHTS}
        more={{ label: 'Подробнее', href: ROUTES.faq }}
      />
      <PrivatePricing
        description="Прогулка длительностью 1.5-2 часа, в любом парке внутри МКАДа (и Лосиный остров со стороны Мытищ)"
        prices={PRICES}
        note="Другие длительность и локации рассчитываются индивидуально."
        terms={TERMS}
      />
    </main>
  )
}
