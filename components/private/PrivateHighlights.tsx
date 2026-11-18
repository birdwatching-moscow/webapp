import { HighlightCard } from '@/components/cards/HighlightCard'
import { Button } from '@/components/ui/buttons/Button'
import styles from './PrivateHighlights.module.css'

export type PrivateHighlight = {
  title: string
  description: React.ReactNode
}

type PrivateHighlightsProps = {
  title: string
  highlights: readonly PrivateHighlight[]
  more: { label: string; href: string }
}

/** «Важно знать»: swipeable cards on mobile, 3-column grid on desktop. */
export const PrivateHighlights = ({ title, highlights, more }: PrivateHighlightsProps) => (
  <section className={styles.section} aria-label={title}>
    <h2 className={`text-h1 ${styles.title}`}>{title}</h2>
    <ul className={styles.list}>
      {highlights.map((highlight) => (
        <li key={highlight.title} className={styles.item}>
          <HighlightCard title={highlight.title} description={highlight.description} />
        </li>
      ))}
    </ul>
    <Button as="a" href={more.href} variant="secondary" size="lg" fullWidth className={styles.more}>
      {more.label}
    </Button>
  </section>
)
