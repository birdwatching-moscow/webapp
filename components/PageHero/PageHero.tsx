import { Button } from '@/components/ui/buttons/Button'
import styles from './PageHero.module.css'

type PageHeroProps = {
  title: string
  description: string
  cta: { label: string; href: string }
}

/** Page header without media: h1, lead paragraph and one call to action. */
export const PageHero = ({ title, description, cta }: PageHeroProps) => (
  <section className={styles.hero}>
    <div className={styles.text}>
      <h1 className={`text-display ${styles.title}`}>{title}</h1>
      <p className={`text-body-l ${styles.description}`}>{description}</p>
    </div>
    <Button as="a" href={cta.href} size="lg" fullWidth className={styles.cta}>
      {cta.label}
    </Button>
  </section>
)
