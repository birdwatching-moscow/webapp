import { Button } from '@/components/ui/buttons/Button'
import styles from './NearestSection.module.css'

interface NearestSectionProps {
  heading?: string
  moreHref?: string
  showMoreButton?: boolean
  children: React.ReactNode
}

export const NearestSection = ({
  heading = 'Ближайшие',
  moreHref,
  showMoreButton = false,
  children,
}: NearestSectionProps) => (
  <div className={styles.wrapper}>
    <h2 className={styles.heading}>{heading}</h2>
    {children}
    {showMoreButton && moreHref && (
      <Button as="a" size="lg" href={moreHref} className={styles.moreButton}>
        Подробнее
      </Button>
    )}
  </div>
)
