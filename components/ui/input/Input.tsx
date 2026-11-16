import styles from './Input.module.css';

export type InputProps = {
  id?:          string;
  name?:        string;
  value:        string;
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?:       string;
  error?:       string;
  invalid?:     boolean;
  disabled?:    boolean;
  type?:        'text' | 'email' | 'tel' | 'password';
  className?:   string;
  trailing?:    React.ReactNode;
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
  invalid,
  disabled,
  type = 'text',
  className,
  trailing,
  ...rest
}: InputProps) => {
  const hasError = Boolean(error);
  const isInvalid = hasError || Boolean(invalid);
  const errorId = id ? `${id}-error` : undefined;

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && id && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputRow}>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={isInvalid ? 'true' : undefined}
          aria-describedby={hasError && errorId ? errorId : undefined}
          className={[styles.input, isInvalid ? styles.error : '', trailing ? styles.withTrailing : ''].filter(Boolean).join(' ')}
          {...rest}
        />
        {trailing && <span className={styles.trailing}>{trailing}</span>}
      </div>
      {hasError && (
        <p id={errorId} role="alert" className={styles.errorMessage}>
          {error}
        </p>
      )}
    </div>
  );
};
