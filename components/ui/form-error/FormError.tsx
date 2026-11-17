import styles from './FormError.module.css'

type Props = { message: string | null | undefined }

export const FormError = ({ message }: Props) => {
  if (!message) return null
  return <p role="alert" className={styles.error}>{message}</p>
}
