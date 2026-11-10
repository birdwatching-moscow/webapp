import { ImageUpload } from '@/components/admin/ImageUpload'
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
      <ImageUpload
        folder="walks"
        value={coverUrl}
        onChange={onCoverUrl}
        disabled={disabled}
        required={requireAll}
      />
    </section>
  )
}
