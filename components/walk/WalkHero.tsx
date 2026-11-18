import Image from 'next/image'
import { Button } from '@/components/ui/buttons/Button'
import { PhotoWithTextCredit } from '@/components/PhotoWithTextCredit/PhotoWithTextCredit'
import { formatDurationRange } from '@/utils/formatDurationRange'
import styles from './WalkHero.module.css'

const MOS_TZ = 'Europe/Moscow'

function getDateParts(startsAt: Date) {
  const dateStr = startsAt.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: MOS_TZ,
  })
  const [day, month] = dateStr.split(' ')
  return { day, month: month.charAt(0).toUpperCase() + month.slice(1) }
}

function getTimeRange(startsAt: Date, endsAt: Date | null) {
  const startHour = startsAt.toLocaleTimeString('ru-RU', { hour: 'numeric', timeZone: MOS_TZ })
  const endHour = endsAt?.toLocaleTimeString('ru-RU', { hour: 'numeric', timeZone: MOS_TZ })
  return endHour ? `С ${startHour} до ${endHour}` : `С ${startHour}`
}

type Props = {
  title: string
  subtitle?: string | null
  startsAt: Date
  endsAt: Date | null
  spotsLeft: number
  coverPhotoUrl?: string | null
  coverPhotoCredit?: string | null
  isSoldOut: boolean
}

export const WalkHero = ({
  title,
  subtitle,
  startsAt,
  endsAt,
  spotsLeft,
  coverPhotoUrl,
  coverPhotoCredit,
  isSoldOut,
}: Props) => {
  const { day, month } = getDateParts(startsAt)
  const timeRange = getTimeRange(startsAt, endsAt)
  const duration = endsAt ? formatDurationRange(startsAt, endsAt) : null

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.text}>
          <h1 className={`text-h1 ${styles.title}`}>{title}</h1>
          {subtitle && <p className={`text-body-l ${styles.subtitle}`}>{subtitle}</p>}
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={`text-display ${styles.statValue}`}>{day}</span>
            <span className={`text-body ${styles.statLabel}`}>{month}</span>
          </div>
          <div className={styles.stat}>
            <span className={`text-h2 ${styles.statValue}`}>{timeRange}</span>
            {duration && <span className={`text-body ${styles.statLabel}`}>{duration}</span>}
          </div>
          <div className={styles.stat}>
            <span className={`text-display ${styles.statValue}`}>{spotsLeft}</span>
            <span className={`text-body ${styles.statLabel}`}>Билетов осталось</span>
          </div>
        </div>

        {!isSoldOut && (
          <Button as="a" href="#payment" size="lg" fullWidth className={styles.cta}>
            Купить
          </Button>
        )}
      </div>

      <div className={styles.photo}>
        {coverPhotoCredit ? (
          <PhotoWithTextCredit
            src={coverPhotoUrl ?? '/placeholders/image-placeholder.png'}
            alt={title}
            credit={coverPhotoCredit}
            sizes="(min-width: 1248px) 50vw, 100vw"
            priority
          />
        ) : (
          <Image
            src={coverPhotoUrl ?? '/placeholders/image-placeholder.png'}
            alt={title}
            fill
            className={styles.photoImg}
            priority
            sizes="(min-width: 1248px) 50vw, 100vw"
          />
        )}
      </div>
    </section>
  )
}
