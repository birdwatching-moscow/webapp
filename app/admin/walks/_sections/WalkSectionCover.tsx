import { ImageUpload } from '@/components/admin/ImageUpload'
import styles from '../[id]/walk-edit.module.css'

interface Props {
  coverUrl: string
  onCoverUrl: (v: string) => void
  coverCredit: string
  onCoverCredit: (v: string) => void
  disabled?: boolean
  requireAll?: boolean
}

export function WalkSectionCover({ coverUrl, onCoverUrl, coverCredit, onCoverCredit, disabled, requireAll }: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Обложка</h2>
      <ImageUpload
        folder="walks"
        value={coverUrl}
        onChange={onCoverUrl}
        disabled={disabled}
        required={requireAll}
      />
      <div className={styles.field}>
        <label className={styles.label}>Подпись к фото</label>
        <input
          className={styles.input}
          value={coverCredit}
          onChange={e => onCoverCredit(e.target.value)}
          disabled={disabled}
          placeholder="Например: Фото: Иван Иванов · Личный архив"
          maxLength={500}
        />
      </div>
    </section>
  )
}
