import styles from '../[id]/walk-edit.module.css'

interface Props {
  startsAt: string
  endsAt: string
  location?: string
  onStartsAt: (v: string) => void
  onEndsAt: (v: string) => void
  onLocation?: (v: string) => void
  disabled?: boolean
  requireAll?: boolean
  requireStartsAt?: boolean
  durationDays?: string
  onDurationDays?: (v: string) => void
  dateOnly?: boolean
}

export function WalkSectionDateTime({
  startsAt, endsAt, location,
  onStartsAt, onEndsAt, onLocation,
  disabled, requireAll, requireStartsAt,
  durationDays, onDurationDays,
  dateOnly,
}: Props) {
  const startRequired = requireAll || requireStartsAt
  const inputType = dateOnly ? 'date' : 'datetime-local'
  const dateOrderError = startsAt && endsAt && endsAt <= startsAt

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{dateOnly ? 'Даты' : 'Дата и место'}</h2>
      <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
        <div className={styles.field}>
          <label className={`${styles.label} ${startRequired ? styles.required : ''}`}>Начало</label>
          <input
            className={styles.input}
            type={inputType}
            value={startsAt}
            onChange={e => onStartsAt(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Окончание</label>
          <input
            className={`${styles.input}${dateOrderError ? ` ${styles.inputError}` : ''}`}
            type={inputType}
            value={endsAt}
            onChange={e => onEndsAt(e.target.value)}
            disabled={disabled}
          />
          {dateOrderError && (
            <span className={styles.fieldError}>Дата окончания не может быть раньше даты начала</span>
          )}
        </div>
        {onDurationDays !== undefined && (
          <div className={styles.field}>
            <label className={styles.label}>Длительность (дней)</label>
            <input
              className={styles.input}
              type="number"
              min="1"
              value={durationDays ?? ''}
              onChange={e => onDurationDays(e.target.value)}
              disabled={disabled}
              placeholder="Например: 10"
            />
          </div>
        )}
        {onLocation !== undefined && (
          <div className={`${styles.field} ${styles.fieldFullWidth}`}>
            <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Локация</label>
            <input
              className={styles.input}
              value={location ?? ''}
              onChange={e => onLocation(e.target.value)}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </section>
  )
}
