import { Button, type ButtonProps } from '@/components/ui/buttons/Button'
import styles from './NoticeBanner.module.css'

type ButtonVariant = NonNullable<ButtonProps['variant']>

type ButtonConfig =
  | { label: string; href: string; variant?: ButtonVariant; onClick?: never }
  | { label: string; href?: never; onClick: () => void; variant?: ButtonVariant }

type NoticeBannerProps = {
  title?: React.ReactNode
  text: React.ReactNode
  buttons?: [ButtonConfig] | [ButtonConfig, ButtonConfig]
  stackButtons?: boolean
  className?: string
}

export const NoticeBanner = ({ title, text, buttons, stackButtons, className }: NoticeBannerProps) => (
  <div className={[styles.banner, className].filter(Boolean).join(' ')}>
    <div className={styles.content}>
      {title && <p className={`text-body-l ${styles.title}`}>{title}</p>}
      <p className={`text-body-l ${styles.text}`}>{text}</p>
    </div>
    {buttons && buttons.length > 0 && (
      <div className={[styles.actions, stackButtons && styles.actionsStacked].filter(Boolean).join(' ')}>
        {buttons.map((btn) =>
          btn.href ? (
            <Button
              key={btn.href}
              as="a"
              href={btn.href}
              variant={btn.variant ?? 'secondary'}
              size="sm"
              fullWidth={stackButtons}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btn}
            >
              {btn.label}
            </Button>
          ) : (
            <Button
              key={btn.label}
              variant={btn.variant ?? 'secondary'}
              size="sm"
              fullWidth={stackButtons}
              onClick={btn.onClick}
              className={styles.btn}
            >
              {btn.label}
            </Button>
          )
        )}
      </div>
    )}
  </div>
)
