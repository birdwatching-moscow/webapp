import { Button } from '@/components/ui/buttons/Button'
import styles from './NearestSection.module.css'

interface NearestSectionProps {
  heading?: string
  moreHref?: string
  showMoreButton?: boolean
  isEmpty?: boolean
  children?: React.ReactNode
}

export const NearestSection = ({
  heading = 'Ближайшие',
  moreHref,
  showMoreButton = false,
  isEmpty = false,
  children,
}: NearestSectionProps) => (
  <div className={styles.wrapper}>
    {!isEmpty && <h2 className={styles.heading}>{heading}</h2>}
    {!isEmpty && children}
    {(showMoreButton || isEmpty) && moreHref && (
      <Button as="a" size="lg" fullWidth href={moreHref} className={styles.moreButton}>
        Подробнее
      </Button>
    )}
  </div>
)
