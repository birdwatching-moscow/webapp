import { Button } from '@/components/ui/buttons/Button'
import styles from './NoticeBanner.module.css'

type ButtonConfig = {
  label: string
  href: string
}

type NoticeBannerProps = {
  text: string
  buttons?: [ButtonConfig] | [ButtonConfig, ButtonConfig]
  className?: string
}

export const NoticeBanner = ({ text, buttons, className }: NoticeBannerProps) => (
  <div className={[styles.banner, className].filter(Boolean).join(' ')}>
    <p className={`text-body-l ${styles.text}`}>{text}</p>
    {buttons && buttons.length > 0 && (
      <div className={styles.actions}>
        {buttons.map(({ label, href }) => (
          <Button
            key={href}
            as="a"
            href={href}
            variant="secondary"
            size="sm"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btn}
          >
            {label}
          </Button>
        ))}
      </div>
    )}
  </div>
)
