import type { Guide } from './types'
import styles from '../[id]/walk-edit.module.css'

interface Props {
  guides: Guide[]
  guideId: string
  guideId2: string
  onGuideId: (v: string) => void
  onGuideId2: (v: string) => void
  disabled?: boolean
  requireAll?: boolean
  requireGuide?: boolean
  placeholderOption?: boolean
}

export function WalkSectionGuides({
  guides, guideId, guideId2,
  onGuideId, onGuideId2,
  disabled, requireAll, requireGuide, placeholderOption,
}: Props) {
  const guide2Options = guides.filter(g => g.id !== Number(guideId))
  const isRequired = requireAll || requireGuide

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Гиды</h2>
      <div className={styles.guidesRow}>
        <div className={styles.guideField}>
          <label className={`${styles.label} ${isRequired ? styles.required : ''}`}>Гид</label>
          <select
            className={styles.select}
            value={guideId}
            onChange={e => {
              onGuideId(e.target.value)
              if (e.target.value === guideId2) onGuideId2('')
            }}
            disabled={disabled}
            required={isRequired}
          >
            {placeholderOption && <option value="" disabled>Выберите гида</option>}
            {guides.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {guideId2 ? (
          <>
            <div className={styles.guideField}>
              <label className={styles.label}>Второй гид</label>
              <select
                className={styles.select}
                value={guideId2}
                onChange={e => onGuideId2(e.target.value)}
                disabled={disabled}
              >
                {guide2Options.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            {!disabled && (
              <button
                type="button"
                className={styles.removeGuideBtn}
                onClick={() => onGuideId2('')}
                aria-label="Убрать второго гида"
              >
                ×
              </button>
            )}
          </>
        ) : (
          !disabled && guide2Options.length > 0 && (
            <button
              type="button"
              className={styles.addGuideBtn}
              onClick={() => onGuideId2(String(guide2Options[0].id))}
            >
              + Второй гид
            </button>
          )
        )}
      </div>
    </section>
  )
}
