import styles from './Input.module.css';

export type InputProps = {
  id?:          string;
  name?:        string;
  value:        string;
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?:       string;
  error?:       string;
  disabled?:    boolean;
  type?:        'text' | 'email' | 'tel' | 'password';
  className?:   string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'id' | 'name' | 'disabled' | 'placeholder' | 'className'
>;

export const Input = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled,
  type = 'text',
  className,
  ...rest
}: InputProps) => {
  const hasError = Boolean(error);
  const errorId = id ? `${id}-error` : undefined;

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && id && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError && errorId ? errorId : undefined}
        className={[styles.input, hasError ? styles.error : ''].filter(Boolean).join(' ')}
        {...rest}
      />
      {hasError && (
        <p id={errorId} role="alert" className={styles.errorMessage}>
          {error}
        </p>
      )}
    </div>
  );
};
