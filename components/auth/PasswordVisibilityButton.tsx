import { EyeIcon } from '@/components/icons/EyeIcon'
import { EyeOffIcon } from '@/components/icons/EyeOffIcon'
import styles from './PasswordVisibilityButton.module.css'

const SHOW_LABEL = 'Показать пароль'
const HIDE_LABEL = 'Скрыть пароль'

type Props = { visible: boolean; onToggle: () => void }

/** Eye button inside a password input that shows / hides the value. */
export const PasswordVisibilityButton = ({ visible, onToggle }: Props) => (
  <button type="button" className={styles.eyeButton} onClick={onToggle} aria-label={visible ? HIDE_LABEL : SHOW_LABEL}>
    {visible ? <EyeOffIcon /> : <EyeIcon />}
  </button>
)
