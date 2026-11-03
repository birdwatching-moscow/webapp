import styles from './Fact.module.css'

export type FactProps = {
  value: string
  label: string
  className?: string
}

export const Fact = ({ value, label, className }: FactProps) => {
  const cls = [styles.root, className].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <p className="text-h1">{value}</p>
      <p className="text-body-l">{label}</p>
    </div>
  )
}
