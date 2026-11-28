import { Button } from '@/components/ui/buttons/Button'
import { pluralRu } from '@/utils/pluralRu'
import type { BirdIdPublicData } from '@/lib/birdid'
import styles from './BirdIdHeroInfo.module.css'

const MOS_TZ = 'Europe/Moscow'

function formatDateRange(startsAt: Date | null, endsAt: Date | null): string | null {
  if (!startsAt) return null
  const start = startsAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: MOS_TZ })
  if (!endsAt) return `С ${start}`
  const end = endsAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: MOS_TZ })
  return `С ${start} по ${end}`
}

type Props = Pick<BirdIdPublicData, 'title' | 'subtitle' | 'formUrl' | 'startsAt' | 'endsAt' | 'durationDays' | 'durationHours' | 'difficulty' | 'registrationOpen'>

export const BirdIdHeroInfo = ({
  title,
  subtitle,
  formUrl,
  startsAt,
  endsAt,
  durationDays,
  durationHours,
  difficulty,
  registrationOpen,
}: Props) => {
  const dateRange = formatDateRange(startsAt, endsAt)
  const showCta = registrationOpen && formUrl

  return (
    <section className={styles.info}>
      <h1 className={`text-display ${styles.title}`}>{title}</h1>
      {subtitle && (
        <p className={`text-body-l ${styles.subtitle}`}>{subtitle}</p>
      )}

      <div className={styles.stats}>
        {durationDays != null && (
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${styles.statNum}`}>
              {pluralRu(durationDays, ['день', 'дня', 'дней'])}
            </span>
            {dateRange && (
              <span className={`text-body-l ${styles.statLabel}`}>{dateRange}</span>
            )}
          </div>
        )}

        {durationHours != null && (
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${styles.statNum}`}>
              {pluralRu(durationHours, ['час', 'часа', 'часов'])}
            </span>
            <span className={`text-body-l ${styles.statLabel}`}>Длительность курса</span>
          </div>
        )}

        {difficulty != null && (
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${styles.statNum}`}>{difficulty}/10</span>
            <span className={`text-body-l ${styles.statLabel}`}>Сложность</span>
          </div>
        )}
      </div>

      {showCta && (
        <Button as="a" href={formUrl} target="_blank" rel="noopener noreferrer" size="lg" fullWidth className={styles.cta}>
          Заполнить форму
        </Button>
      )}
    </section>
  )
}
