import { AspectRatioImage } from '@/components/ui/aspect-ratio-image/AspectRatioImage'
import type { ConsultationTopic } from '@/lib/private/consultations'
import styles from './PrivateTopicCard.module.css'

type PrivateTopicCardProps = {
  topic: ConsultationTopic
}

export const PrivateTopicCard = ({ topic }: PrivateTopicCardProps) => {
  const description = typeof topic.description === 'string' ? topic.description : topic.description[0]
  return (
    <article className={styles.card}>
      <AspectRatioImage
        ratio="16-9"
        src="/placeholders/image-placeholder.png"
        alt=""
      />
      <p className={`text-h2 ${styles.title}`}>{topic.title}</p>
      <p className={`text-body-l ${styles.description}`}>{description}</p>
    </article>
  )
}
