import type { Guide } from './types'
import styles from '../[id]/walk-edit.module.css'

interface Props {
  guides: Guide[]
  guideId: string
  onGuideId: (v: string) => void
  disabled?: boolean
  requireAll?: boolean
  requireGuide?: boolean
  placeholderOption?: boolean
}

export function WalkSectionGuides({
  guides, guideId, onGuideId,
  disabled, requireAll, requireGuide, placeholderOption,
}: Props) {
  const isRequired = requireAll || requireGuide

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Гид</h2>
      <div className={styles.guideField}>
        <label className={`${styles.label} ${isRequired ? styles.required : ''}`}>Гид</label>
        <select
          className={styles.select}
          value={guideId}
          onChange={e => onGuideId(e.target.value)}
          disabled={disabled}
          required={isRequired}
        >
          {placeholderOption && <option value="" disabled>Выберите гида</option>}
          {guides.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>
    </section>
  )
}
