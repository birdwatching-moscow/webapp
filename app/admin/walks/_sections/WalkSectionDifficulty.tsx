import styles from '../[id]/walk-edit.module.css'

interface Props {
  value: number | null
  onChange: (v: number | null) => void
  required?: boolean
  disabled?: boolean
}

export function WalkSectionDifficulty({ value, onChange, required, disabled }: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Сложность</h2>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={`${styles.label}${required ? ` ${styles.required}` : ''}`}>
            По 10-балльной шкале
          </label>
          <div className={styles.difficultyPicker}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                className={`${styles.difficultyChip}${value === n ? ` ${styles.difficultyChipActive}` : ''}`}
                onClick={() => onChange(value === n ? null : n)}
                disabled={disabled}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
