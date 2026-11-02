'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Dropdown.module.css';

export type DropdownOption = {
  label: string;
  value: number;
};

export type DropdownProps = {
  value:     number;
  onChange:  (value: number) => void;
  options:   DropdownOption[];
  disabled?: boolean;
  label?:    string;
};

export const Dropdown = ({ value, onChange, options, disabled, label }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef   = useRef<HTMLButtonElement>(null);

  const selected = options.find(o => o.value === value);
  const triggerLabel = selected?.label ?? '–';

  const open  = () => { if (!disabled) setIsOpen(true); };
  const close = () => setIsOpen(false);

  const handleTriggerClick = () => {
    if (disabled) return;
    setIsOpen(prev => !prev);
  };

  const handleOptionClick = (optValue: number) => {
    onChange(optValue);
    close();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen]);

  const triggerId = label ? `dropdown-trigger-${value}` : undefined;

  return (
    <div ref={containerRef} className={styles.wrapper}>
      {label && triggerId && (
        <label htmlFor={triggerId} className={styles.label}>
          {label}
        </label>
      )}
      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        className={[styles.trigger, disabled ? styles.disabled : ''].filter(Boolean).join(' ')}
        onClick={handleTriggerClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-disabled={disabled ? 'true' : undefined}
      >
        <span className={styles.triggerLabel}>{triggerLabel}</span>
        <span className={[styles.chevron, isOpen ? styles.chevronOpen : ''].filter(Boolean).join(' ')} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <ul role="listbox" className={styles.list}>
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value ? 'true' : 'false'}
              className={[styles.option, opt.value === value ? styles.optionSelected : ''].filter(Boolean).join(' ')}
              onClick={() => handleOptionClick(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
