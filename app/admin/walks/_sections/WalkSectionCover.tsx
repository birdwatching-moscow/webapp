import styles from '../[id]/walk-edit.module.css'

interface Props {
  coverUrl: string
  onCoverUrl: (v: string) => void
  disabled?: boolean
  requireAll?: boolean
}

export function WalkSectionCover({ coverUrl, onCoverUrl, disabled, requireAll }: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Обложка</h2>
      <div className={styles.photoPlaceholder}>
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="Обложка" className={styles.photoThumb} />
        )}
        <div className={`${styles.field} ${styles.photoUrlField}`}>
          <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>URL фото</label>
          <input
            className={styles.input}
            type="url"
            value={coverUrl}
            onChange={e => onCoverUrl(e.target.value)}
            disabled={disabled}
            placeholder="https://..."
          />
          <span className={styles.photoNote}>Выбор из медиатеки появится позже</span>
        </div>
      </div>
    </section>
  )
}
