import { OtpInput } from '@/components/ui/otp/OtpInput'
import { FormError } from '@/components/ui/form-error/FormError'
import { Button } from '@/components/ui/buttons/Button'
import type { useOtpInput } from '@/hooks/useOtpInput'
import { AUTH_LABELS } from '@/lib/auth-labels'
import styles from './OtpStep.module.css'

type Props = {
  title: string
  subtitle: string
  otp: ReturnType<typeof useOtpInput>
  error: string | null
  loading: boolean
  onBack: () => void
  /** When provided, a "resend code" button is shown above "Назад". */
  onResend?: () => void
  /** Non-error status, e.g. confirmation that a new code was sent. */
  notice?: string | null
}

export const OtpStep = ({ title, subtitle, otp, error, loading, onBack, onResend, notice }: Props) => (
  <>
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>

    <OtpInput
      digits={otp.digits}
      digitRefs={otp.digitRefs}
      hasError={Boolean(error)}
      disabled={loading}
      onChange={otp.handleChange}
      onKeyDown={otp.handleKeyDown}
      onPaste={otp.handlePaste}
    />

    <FormError message={error} />

    {notice && <p role="status" className={styles.notice}>{notice}</p>}

    <p className={styles.hint}>
      Код действует ограниченное время. Проверьте «Спам» и «Промоакции».
    </p>

    <div className={styles.actions}>
      {onResend && (
        <Button size="lg" type="button" fullWidth onClick={onResend} loading={loading} disabled={loading}>
          {AUTH_LABELS.loginCode.resendCode}
        </Button>
      )}
      <Button variant="outline" size="lg" type="button" fullWidth onClick={onBack} disabled={loading}>
        Назад
      </Button>
    </div>
  </>
)
