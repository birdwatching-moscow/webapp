import Link from 'next/link'
import { PhotoCard } from '@/components/PhotoCard/PhotoCard'
import styles from './InfoCard.module.css'

interface InfoCardProps {
  imageSrc: string
  imageAlt: string
  title: string
  description: string
  label?: string
  href?: string
}

export const InfoCard = ({ imageSrc, imageAlt, title, description, label, href }: InfoCardProps) => {
  const content = (
    <>
      <PhotoCard src={imageSrc} alt={imageAlt} className={styles.photo} />
      <div className={styles.text}>
        {label && <span className={`text-label ${styles.label}`}>{label}</span>}
        <h3 className={`text-h2 ${styles.title}`}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={`${styles.card} ${styles.link}`}>
        {content}
      </Link>
    )
  }

  return <div className={styles.card}>{content}</div>
}
