import { OtpInput } from '@/components/ui/otp/OtpInput'
import { FormError } from '@/components/ui/form-error/FormError'
import { Button } from '@/components/ui/buttons/Button'
import type { useOtpInput } from '@/hooks/useOtpInput'
import styles from './OtpStep.module.css'

type Props = {
  title: string
  subtitle: string
  otp: ReturnType<typeof useOtpInput>
  error: string | null
  loading: boolean
  onBack: () => void
}

export const OtpStep = ({ title, subtitle, otp, error, loading, onBack }: Props) => (
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

    <p className={styles.hint}>
      Код действует ограниченное время. Проверьте «Спам» и «Промоакции».
    </p>

    <div className={styles.actions}>
      <Button variant="outline" size="lg" type="button" fullWidth onClick={onBack} disabled={loading}>
        Назад
      </Button>
    </div>
  </>
)
