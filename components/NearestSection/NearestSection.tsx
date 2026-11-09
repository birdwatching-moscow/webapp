import { Button } from '@/components/ui/buttons/Button'
import styles from './NearestSection.module.css'

interface NearestSectionProps {
  heading?: string
  moreHref?: string
  showMoreButton?: boolean
  emptyMessage?: string
  children: React.ReactNode
}

export const NearestSection = ({
  heading = 'Ближайшие',
  moreHref,
  showMoreButton = false,
  emptyMessage,
  children,
}: NearestSectionProps) => (
  <div className={styles.wrapper}>
    {!emptyMessage && <h2 className={styles.heading}>{heading}</h2>}
    {emptyMessage ? (
      <p className={`text-body ${styles.emptyMessage}`}>{emptyMessage}</p>
    ) : (
      children
    )}
    {(showMoreButton || emptyMessage) && moreHref && (
      <Button as="a" size="lg" fullWidth href={moreHref} className={styles.moreButton}>
        Подробнее
      </Button>
    )}
  </div>
)
