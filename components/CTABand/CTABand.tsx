import { Button } from '@/components/ui/buttons/Button'
import styles from './CTABand.module.css'

interface CTABandProps {
  title: string
  description: string
  buttonLabel: string
  href: string
}

export const CTABand = ({ title, description, buttonLabel, href }: CTABandProps) => (
  <div data-testid="cta-band" className={styles.band}>
    <div className={styles.group}>
      <h2 className={`text-h2 ${styles.title}`}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </div>
    <Button as="a" size="lg" fullWidth href={href} className={styles.cta}>
      {buttonLabel}
    </Button>
  </div>
)
