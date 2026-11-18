import type { ReactNode } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import styles from './PageHero.module.css'

type PageHeroAction =
  /** Link button, e.g. a jump to a section on the page */
  | { cta: { label: string; href: string }; action?: never }
  /** Any custom control, e.g. a button that opens a modal */
  | { action: ReactNode; cta?: never }

type PageHeroProps = {
  title: string
  /** One paragraph, or several rendered as separate <p> */
  description: string | readonly string[]
} & PageHeroAction

/** Page header without media: h1, lead paragraph(s) and one call to action. */
export const PageHero = ({ title, description, cta, action }: PageHeroProps) => {
  const paragraphs = typeof description === 'string' ? [description] : description

  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <h1 className={`text-display ${styles.title}`}>{title}</h1>
        <div className={styles.paragraphs}>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className={`text-body-l ${styles.description}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      {cta ? (
        <Button as="a" href={cta.href} size="lg" fullWidth className={styles.cta}>
          {cta.label}
        </Button>
      ) : (
        <div className={styles.cta}>{action}</div>
      )}
    </section>
  )
}
