import Link from 'next/link'
import { PhotoCard } from '@/components/PhotoCard/PhotoCard'
import { ROUTES } from '@/utils/routes'
import { formatExpeditionDate } from '@/utils/formatExpeditionDate'
import type { ExpeditionCardRow } from '@/lib/expeditions'
import styles from './ExpeditionCard.module.css'

interface ExpeditionCardProps {
  expedition: ExpeditionCardRow
}

export const ExpeditionCard = ({ expedition }: ExpeditionCardProps) => {
  const dateLabel = formatExpeditionDate(expedition.startsAt, expedition.endsAt)

  return (
    <Link href={ROUTES.expedition(expedition.slug)} className={styles.card}>
      <PhotoCard src={expedition.coverPhotoUrl} alt={expedition.title} className={styles.photo} />
      <div className={styles.text}>
        <span className={`text-label ${styles.date}`}>{dateLabel}</span>
        <h3 className={`text-h2 ${styles.title}`}>{expedition.title}</h3>
        <p className={styles.desc}>{expedition.description}</p>
      </div>
    </Link>
  )
}
