import styles from '../[id]/walk-edit.module.css'

interface Props {
  startsAt: string
  endsAt: string
  location: string
  onStartsAt: (v: string) => void
  onEndsAt: (v: string) => void
  onLocation: (v: string) => void
  disabled?: boolean
  requireAll?: boolean
  requireStartsAt?: boolean
}

export function WalkSectionDateTime({
  startsAt, endsAt, location,
  onStartsAt, onEndsAt, onLocation,
  disabled, requireAll, requireStartsAt,
}: Props) {
  const startRequired = requireAll || requireStartsAt
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Дата и место</h2>
      <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
        <div className={styles.field}>
          <label className={`${styles.label} ${startRequired ? styles.required : ''}`}>Начало</label>
          <input
            className={styles.input}
            type="datetime-local"
            value={startsAt}
            onChange={e => onStartsAt(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Окончание</label>
          <input
            className={styles.input}
            type="datetime-local"
            value={endsAt}
            min={startsAt || undefined}
            onChange={e => onEndsAt(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className={`${styles.field} ${styles.fieldFullWidth}`}>
          <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Локация</label>
          <input
            className={styles.input}
            value={location}
            onChange={e => onLocation(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  )
}
