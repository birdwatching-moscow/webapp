import Image from 'next/image'
import styles from './PhotoCard.module.css'

const LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.'

interface PhotoCardProps {
  src: string
  alt: string
  caption?: string
  className?: string
}

export const PhotoCard = ({ src, alt, caption, className }: PhotoCardProps) => (
  <div className={`${styles.card} ${className ?? ''}`}>
    <Image src={src} alt={alt} fill className={styles.image} />

    <span data-testid="photo-info-icon" className={styles.icon} aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.248 22V8.512H13.824V22H10.248ZM12 6.328C11.328 6.328 10.784 6.136 10.368 5.752C9.952 5.352 9.744 4.848 9.744 4.24C9.744 3.616 9.952 3.112 10.368 2.728C10.784 2.344 11.328 2.152 12 2.152C12.672 2.152 13.216 2.344 13.632 2.728C14.048 3.112 14.256 3.616 14.256 4.24C14.256 4.848 14.048 5.352 13.632 5.752C13.216 6.136 12.672 6.328 12 6.328Z" fill="white"/>
      </svg>
    </span>

    <p data-testid="photo-caption" className={styles.caption}>
      {caption ?? LOREM_IPSUM}
    </p>
  </div>
)
