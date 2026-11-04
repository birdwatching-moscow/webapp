import Image from 'next/image'
import Link from 'next/link'
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
      <div className={styles.imageWrap}>
        <Image
          src={expedition.coverPhotoUrl}
          alt={expedition.title}
          fill
          className={styles.image}
          sizes="(min-width: 1248px) 405px, 326px"
        />
      </div>
      <div className={styles.text}>
        <span className={styles.date}>{dateLabel}</span>
        <h3 className={styles.title}>{expedition.title}</h3>
        <p className={styles.desc}>{expedition.description}</p>
      </div>
    </Link>
  )
}
