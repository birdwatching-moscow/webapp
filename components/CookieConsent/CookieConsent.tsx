'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NoticeBanner } from '@/components/NoticeBanner/NoticeBanner'
import styles from './cookie-consent.module.css'

const STORAGE_KEY = 'cookie-consent'

const text = (
  <>
    Мы используем файлы cookie и метрические данные для работы сайта и аналитики.
    {' '}Подробнее — в{' '}
    <Link href="/oferta" className={styles.link}>Политике конфиденциальности</Link>.
  </>
)

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // localStorage blocked (private mode) — don't show
    }
  }, [])

  const dismiss = (value: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.overlay}>
      <NoticeBanner
        text={text}
        stackButtons
        buttons={[
          { label: 'Принять', variant: 'default', onClick: () => dismiss('accepted') },
          { label: 'Отказаться', variant: 'outline', onClick: () => dismiss('rejected') },
        ]}
      />
    </div>
  )
}
