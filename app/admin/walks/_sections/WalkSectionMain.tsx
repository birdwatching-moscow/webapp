import styles from '../[id]/walk-edit.module.css'

interface Props {
  titleId: string
  title: string
  subtitle: string
  description: string
  onTitle: (v: string) => void
  onSubtitle: (v: string) => void
  onDescription: (v: string) => void
  disabled?: boolean
  requireAll?: boolean
  autoFocusTitle?: boolean
  showSubtitle?: boolean
  titlePlaceholder?: string
  descriptionLabel?: string
}

export function WalkSectionMain({
  titleId, title, subtitle, description,
  onTitle, onSubtitle, onDescription,
  disabled, requireAll, autoFocusTitle,
  showSubtitle = true,
  titlePlaceholder = 'Например: Утренний бёрдвотчинг в Коломенском',
  descriptionLabel = 'Описание',
}: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Основное</h2>

      <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
        <div className={`${styles.field} ${styles.fieldFullWidth}`}>
          <label className={`${styles.label} ${styles.required}`} htmlFor={titleId}>
            Название
          </label>
          <input
            id={titleId}
            className={styles.input}
            value={title}
            onChange={e => onTitle(e.target.value)}
            disabled={disabled}
            placeholder={titlePlaceholder}
            autoFocus={autoFocusTitle}
          />
        </div>

        {showSubtitle && (
          <div className={`${styles.field} ${styles.fieldFullWidth}`}>
            <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>
              Подзаголовок
            </label>
            <input
              className={styles.input}
              value={subtitle}
              onChange={e => onSubtitle(e.target.value)}
              disabled={disabled}
              placeholder="Краткое описание под заголовком"
            />
          </div>
        )}

        <div className={`${styles.field} ${styles.fieldFullWidth}`}>
          <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>
            {descriptionLabel}
          </label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={e => onDescription(e.target.value)}
            disabled={disabled}
            rows={6}
          />
        </div>
      </div>
    </section>
  )
}
