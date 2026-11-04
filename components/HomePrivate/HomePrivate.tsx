import { Button } from '@/components/ui/buttons/Button'
import { InfoCard } from '@/components/InfoCard/InfoCard'
import { SectionIntro } from '@/components/SectionIntro/SectionIntro'
import { ROUTES } from '@/utils/routes'
import styles from './HomePrivate.module.css'

const TITLE = 'Частные события'
const DESCRIPTION =
  'Мы организуем частные прогулки с акцентом на бердвотчинг или общую натуралистику, адаптируя маршрут и программу под ваши интересы. Также проводим частные лекции для компаний, институтов и других групп.'

// PLACEHOLDER: replace with real photos for each event type
const PLACEHOLDER_IMAGE = '/images/home-walks.jpg'

const EVENT_TYPES = [
  {
    href: ROUTES.privateWalks,
    title: 'Персональная прогулка в Москве и окрестностях',
    description:
      'Подберём место, дату и маршрут с учётом сезона, вашего опыта и того, каких птиц вам хотелось бы увидеть. Можно выбрать одну из наших проверенных локаций или обсудить другой маршрут.',
  },
  {
    href: ROUTES.privateLectures,
    title: 'Лекции',
    description:
      'Подберём место, дату и маршрут с учётом сезона, вашего опыта и того, каких птиц вам хотелось бы увидеть. Можно выбрать одну из наших проверенных локаций или обсудить другой маршрут.',
  },
  {
    href: ROUTES.privateConsultations,
    title: 'Персональные консультации',
    description:
      'Поможем спланировать самостоятельное birdwatching-путешествие, сделать территорию безопаснее и привлекательнее для птиц, разобраться с профессиональным развитием или разработать собственный проект.',
  },
] as const

export const HomePrivate = () => (
  <section data-testid="home-private" className={styles.section}>
    <SectionIntro title={TITLE} description={DESCRIPTION} />

    <div className={styles.cards}>
      {EVENT_TYPES.map((event) => (
        <InfoCard
          key={event.title}
          href={event.href}
          imageSrc={PLACEHOLDER_IMAGE}
          imageAlt={event.title}
          title={event.title}
          description={event.description}
        />
      ))}
    </div>

    <Button as="a" size="lg" fullWidth href={ROUTES.privateEvents} className={styles.moreButton}>
      Подробнее
    </Button>
  </section>
)
