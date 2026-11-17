import { Button } from '@/components/ui/buttons/Button'
import { EditorialCard } from '@/components/cards/EditorialCard'
import { ROUTES } from '@/utils/routes'
import styles from './HomeMedia.module.css'

const TITLE = 'СМИ, научные и научно-популярные журналы о нас'

const PUBLICATIONS = [
  {
    href: 'https://t-j.ru/big-birding-day/',
    logoSrc: '/images/media/t-bank.png',
    logoAlt: 'Т—Ж',
    title: 'Отправьтесь на московский бердвотчинг Т—Ж',
    subtitle: 'Учимся распознавать птиц по голосам и участвуем в Большом дне',
  },
  {
    href: 'https://journal.timepad.ru/learn/chto-takoe-byordvotching',
    logoSrc: '/images/media/timepad.png',
    logoAlt: 'Timepad',
    title: 'Что такое бёрдвотчинг и в чём его фишка',
    subtitle:
      'Бёрдвотчинг — не новое, но как будто очень нужное занятие. Поговорили с орнитологом, как птицы спасают нашу менталочку',
  },
] as const

export const HomeMedia = () => (
  <section data-testid="home-media" className={styles.section}>
    <h2 className={`text-h1 ${styles.title}`}>{TITLE}</h2>

    <div className={styles.cards}>
      {PUBLICATIONS.map((pub) => (
        <EditorialCard
          key={pub.href}
          href={pub.href}
          imageUrl={pub.logoSrc}
          imageAlt={pub.logoAlt}
          title={pub.title}
          subtitle={pub.subtitle}
        />
      ))}
    </div>

    <Button as="a" variant="secondary" size="lg" fullWidth href={ROUTES.media} className={styles.moreButton}>
      Посмотреть все
    </Button>
  </section>
)
