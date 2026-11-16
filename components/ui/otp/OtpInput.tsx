import { LOGIN_CODE_LENGTH } from '@/lib/constants'
import styles from './OtpInput.module.css'

type Props = {
  digits: string[]
  digitRefs: React.MutableRefObject<Array<HTMLInputElement | null>>
  hasError?: boolean
  disabled?: boolean
  onChange: (index: number, value: string) => void
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  ariaLabel?: string
}

export const OtpInput = ({
  digits,
  digitRefs,
  hasError = false,
  disabled = false,
  onChange,
  onKeyDown,
  onPaste,
  ariaLabel = 'Код подтверждения',
}: Props) => (
  <div className={styles.row} role="group" aria-label={ariaLabel}>
    {Array.from({ length: LOGIN_CODE_LENGTH }).map((_, i) => (
      <input
        key={i}
        ref={el => { digitRefs.current[i] = el }}
        className={[styles.box, hasError ? styles.boxError : ''].filter(Boolean).join(' ')}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={LOGIN_CODE_LENGTH}
        value={digits[i]}
        onChange={e => onChange(i, e.target.value)}
        onKeyDown={e => onKeyDown(i, e)}
        onPaste={onPaste}
        autoComplete={i === 0 ? 'one-time-code' : 'off'}
        disabled={disabled}
        aria-label={`Цифра ${i + 1} из ${LOGIN_CODE_LENGTH}`}
      />
    ))}
  </div>
)
