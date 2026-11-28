import styles from './AlertBanner.module.css'

type Props = {
  text: string
  className?: string
}

export const AlertBanner = ({ text, className }: Props) => (
  <div className={[styles.banner, className].filter(Boolean).join(' ')}>
    <p className={`text-body-l ${styles.text}`}>{text}</p>
  </div>
)
