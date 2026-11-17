import type { PastWalkRow } from '@/lib/walks'
import { formatWalkDateShort } from '@/utils/formatWalkDate'
import styles from './profile.module.css'

export const PastWalksGrid = ({ walks }: { walks: PastWalkRow[] }) => (
  <div className={styles.pastGrid}>
    {walks.map((walk) => (
      <div key={walk.id} className={styles.pastItem}>
        <span className={styles.pastTitle}>{walk.title}</span>
        <span className={styles.pastDate}>{formatWalkDateShort(walk.startsAt, walk.endsAt)}</span>
      </div>
    ))}
  </div>
)
