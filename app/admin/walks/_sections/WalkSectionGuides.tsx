import type { Guide } from './types'
import styles from '../[id]/walk-edit.module.css'

const MAX_GUIDES = 3

interface SingleProps {
  guides: Guide[]
  guideId: string
  onGuideId: (v: string) => void
  disabled?: boolean
  requireAll?: boolean
  requireGuide?: boolean
  placeholderOption?: boolean
  multi?: false
}

interface MultiProps {
  guides: Guide[]
  guideIds: string[]
  onGuideIds: (ids: string[]) => void
  disabled?: boolean
  requireAll?: boolean
  requireGuide?: boolean
  multi: true
}

type Props = SingleProps | MultiProps

export function WalkSectionGuides(props: Props) {
  const isRequired = props.requireAll || props.requireGuide

  if (props.multi) {
    const { guides, guideIds, onGuideIds, disabled } = props
    const atLimit = guideIds.length >= MAX_GUIDES

    function toggle(id: string) {
      if (guideIds.includes(id)) {
        onGuideIds(guideIds.filter(g => g !== id))
      } else if (!atLimit) {
        onGuideIds([...guideIds, id])
      }
    }

    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Гиды</h2>
        <div className={styles.guideField}>
          <label className={`${styles.label} ${isRequired ? styles.required : ''}`}>Гиды</label>
          <div className={styles.checkboxGroup}>
            {guides.map(g => {
              const id = String(g.id)
              const checked = guideIds.includes(id)
              return (
                <label key={g.id} className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(id)}
                    disabled={disabled || (!checked && atLimit)}
                  />
                  {g.name}
                </label>
              )
            })}
          </div>
          {atLimit && <p className={styles.photoNote}>Максимум {MAX_GUIDES} гида</p>}
        </div>
      </section>
    )
  }

  const { guides, guideId, onGuideId, disabled, placeholderOption } = props
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
