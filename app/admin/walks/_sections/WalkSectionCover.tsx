import { ImageUpload } from '@/components/admin/ImageUpload'
import styles from '../[id]/walk-edit.module.css'

type Folder = 'walks' | 'expeditions' | 'team'

interface Props {
  coverUrl: string
  onCoverUrl: (v: string) => void
  coverCredit: string
  onCoverCredit: (v: string) => void
  disabled?: boolean
  requireAll?: boolean
  folder?: Folder
  showCredit?: boolean
}

export function WalkSectionCover({
  coverUrl, onCoverUrl, coverCredit, onCoverCredit,
  disabled, requireAll,
  folder = 'walks',
  showCredit = true,
}: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Обложка</h2>
      <ImageUpload
        folder={folder}
        value={coverUrl}
        onChange={onCoverUrl}
        disabled={disabled}
        required={requireAll}
      />
      {showCredit && (
        <div className={styles.field}>
          <label className={`${styles.label} ${requireAll ? styles.required : ''}`}>Подпись к фото</label>
          <input
            className={styles.input}
            value={coverCredit}
            onChange={e => onCoverCredit(e.target.value)}
            disabled={disabled}
            placeholder="Например: Фото: Иван Иванов · Личный архив"
            maxLength={500}
          />
        </div>
      )}
    </section>
  )
}
