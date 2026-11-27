import { ROUTES } from '@/utils/routes'
import styles from './ConsentCheckbox.module.css'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

export const ConsentCheckbox = ({ checked, onChange, error }: Props) => (
  <div>
    <label className={styles.consent}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className={[styles.checkbox, error ? styles.checkboxError : ''].filter(Boolean).join(' ')}
      />
      <span className={`text-body-m ${styles.text}`}>
        Соглашаюсь на обработку{' '}
        <a href={ROUTES.oferta} target="_blank" rel="noopener noreferrer" className={styles.link}>
          персональных данных
        </a>
      </span>
    </label>
    {error && (
      <p role="alert" className={styles.errorMessage}>{error}</p>
    )}
  </div>
)
