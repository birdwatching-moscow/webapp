import { Button } from '@/components/ui/buttons/Button'
import { PhotoWithTextCredit } from '@/components/PhotoWithTextCredit/PhotoWithTextCredit'
import styles from './ExpeditionHero.module.css'

const MOS_TZ = 'Europe/Moscow'

function formatDateRange(startsAt: Date, endsAt: Date | null): string {
  const startDay = startsAt.toLocaleDateString('ru-RU', { day: 'numeric', timeZone: MOS_TZ })
  const startMonth = startsAt.toLocaleDateString('ru-RU', { month: 'long', timeZone: MOS_TZ })
  const year = (endsAt ?? startsAt).toLocaleDateString('ru-RU', { year: 'numeric', timeZone: MOS_TZ })
  if (!endsAt) return `${startDay} ${startMonth} ${year}`
  const endDay = endsAt.toLocaleDateString('ru-RU', { day: 'numeric', timeZone: MOS_TZ })
  const endMonth = endsAt.toLocaleDateString('ru-RU', { month: 'long', timeZone: MOS_TZ })
  if (startMonth === endMonth) return `${startDay}–${endDay} ${startMonth} ${year}`
  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`
}

type Props = {
  title: string
  description: string
  startsAt: Date
  endsAt: Date | null
  durationDays: number | null
  totalSpots: number
  spotsLeft: number
  difficulty: number | null
  coverPhotoUrl: string
  coverPhotoCredit?: string | null
  isSoldOut: boolean
}

export const ExpeditionHero = ({
  title,
  description,
  startsAt,
  endsAt,
  durationDays,
  totalSpots,
  spotsLeft,
  difficulty,
  coverPhotoUrl,
  coverPhotoCredit,
  isSoldOut,
}: Props) => {
  const dateRange = formatDateRange(startsAt, endsAt)

  return (
    <section className={styles.hero}>
      <div className={styles.photo}>
        <PhotoWithTextCredit
          src={coverPhotoUrl}
          alt={title}
          credit={coverPhotoCredit ?? ''}
          sizes="100vw"
          priority
        />
      </div>

      <div className={styles.content}>
        <div className={styles.text}>
          <h1 className={`text-display ${styles.title}`}>{title}</h1>
          <p className={`text-body-l ${styles.description}`}>{description}</p>
        </div>

        <div className={styles.stats}>
          {durationDays != null && (
            <div className={styles.stat}>
              <span className={`${styles.statValue} ${styles.statNum}`}>{durationDays} дней</span>
              <span className={`text-body-l ${styles.statLabel}`}>{dateRange}</span>
            </div>
          )}

          <div className={styles.stat}>
            <span className={`${styles.statValue} ${styles.statNum}`}>
              {spotsLeft}/{totalSpots}
            </span>
            <span className={`text-body-l ${styles.statLabel}`}>мест осталось</span>
          </div>

          {difficulty != null && (
            <div className={styles.stat}>
              <span className={`${styles.statValue} ${styles.statNum}`}>{difficulty}</span>
              <span className={`text-body-l ${styles.statLabel}`}>сложность</span>
            </div>
          )}
        </div>

        {!isSoldOut && (
          <Button as="a" href="#payment" size="lg" fullWidth className={styles.cta}>
            Записаться
          </Button>
        )}
      </div>
    </section>
  )
}
