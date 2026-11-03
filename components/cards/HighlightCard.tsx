import styles from './HighlightCard.module.css'

export type HighlightCardProps = {
  title: string
  description: string
  className?: string
}

export const HighlightCard = ({ title, description, className }: HighlightCardProps) => {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <p className="text-h2">{title}</p>
      <p className={`text-body-l ${styles.description}`}>{description}</p>
    </div>
  )
}
