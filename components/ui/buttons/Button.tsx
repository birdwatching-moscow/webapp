'use client';

import Link from 'next/link';
import styles from './Button.module.css';

type ButtonVariant = 'default' | 'secondary' | 'ghost';
type ButtonSize    = 'default' | 'sm' | 'lg';

type BaseProps = {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  disabled?:  boolean;
  fullWidth?: boolean;
  className?: string;
  children:   React.ReactNode;
};

type AsButton = BaseProps & { as?: 'button' } & React.ButtonHTMLAttributes<HTMLButtonElement>;
type AsLink   = BaseProps & { as: 'a'; href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export type ButtonProps = AsButton | AsLink;

export const Button = ({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  const cls = [styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ');

  if (rest.as === 'a') {
    const { as: _as, href, ...linkRest } = rest as AsLink;
    return (
      <Link
        href={href}
        className={cls}
        aria-disabled={isDisabled ? 'true' : undefined}
        aria-busy={loading ? 'true' : undefined}
        {...linkRest}
      >
        {children}
      </Link>
    );
  }

  const { as: _as, ...btnRest } = rest as AsButton;
  return (
    <button
      className={cls}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      {...btnRest}
    >
      {children}
    </button>
  );
};
