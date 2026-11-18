import { InfoIcon } from '@/components/icons/InfoIcon'
import { AspectRatioImage } from '@/components/ui/aspect-ratio-image/AspectRatioImage'
import styles from './ConsultationCaseCard.module.css'

const IMAGE_PLACEHOLDER_SRC = '/placeholders/image-placeholder.png'

type ConsultationCaseCardProps = {
  client: string
  description: string
  imageUrl?: string
  /** Photo credit text revealed by the info icon on hover; without it the icon shows but reveals nothing */
  info?: string
}

export const ConsultationCaseCard = ({ client, description, imageUrl, info }: ConsultationCaseCardProps) => (
  <article className={styles.card}>
    <div className={styles.media}>
      <AspectRatioImage
        ratio="16-9"
        src={imageUrl ?? IMAGE_PLACEHOLDER_SRC}
        alt={imageUrl ? client : ''}
        className={styles.image}
      />
      <details className={styles.info}>
        <summary className={styles.icon} aria-label="Информация о фото">
          <InfoIcon />
        </summary>
        {info && <p className={styles.caption}>{info}</p>}
      </details>
    </div>
    <h3 className={`text-h2 ${styles.client}`}>{client}</h3>
    <p className={`text-body-l ${styles.description}`}>{description}</p>
  </article>
)
