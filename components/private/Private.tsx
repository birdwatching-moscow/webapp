import { Button } from '@/components/ui/buttons/Button'
import { ROUTES } from '@/utils/routes'
import styles from './Private.module.css'

// Temporary navigation until the page design is ready
const SECTIONS = [
  { label: 'Парки', href: ROUTES.privateSections.parks },
  { label: 'Лекции', href: ROUTES.privateSections.lectures },
  { label: 'Консультации', href: ROUTES.privateSections.consultations },
] as const

export const Private = () => {
  return (
    <main className={styles.wrap}>
      {SECTIONS.map(({ label, href }) => (
        <Button key={href} as="a" href={href} size="lg" fullWidth className={styles.button}>
          {label}
        </Button>
      ))}
    </main>
  )
}
