'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/logo/Logo'
import styles from './Header.module.css'

const NAV_LINKS = [
  { label: 'Прогулки',   href: '/walks' },
  { label: 'Экспедиции', href: '/expeditions' },
  { label: 'Частные',    href: '/private-events' },
  { label: 'Книга',      href: '/book' },
  { label: 'О проекте',  href: '/about' },
] as const

export const Header = () => {
  const { status } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', isOpen)
    return () => { document.body.classList.remove('no-scroll') }
  }, [isOpen])

  const close = () => setIsOpen(false)

  const renderCta = (onClick?: () => void) => {
    if (status === 'loading') return null
    if (status === 'unauthenticated') {
      return <Link href="/login" className={styles.cta} onClick={onClick}>Войти</Link>
    }
    if (pathname === '/profile') {
      return (
        <button
          type="button"
          className={styles.cta}
          onClick={() => { signOut({ redirectTo: '/' }); onClick?.() }}
        >
          Выйти
        </button>
      )
    }
    return <Link href="/profile" className={styles.cta} onClick={onClick}>Личный кабинет</Link>
  }

  return (
    <header className={styles.header}>
      <Logo />

      <nav className={styles.desktopNav}>
        <div className={styles.navLinks}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href} className={styles.navLink}>{label}</Link>
          ))}
        </div>
        {renderCta()}
      </nav>

      <button
        type="button"
        className={styles.hamburger}
        aria-label="Открыть меню"
        onClick={() => setIsOpen(true)}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.overlayHeader}>
            <Logo />
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Закрыть меню"
              onClick={close}
            >
              <span className={styles.closeBar} />
              <span className={styles.closeBar} />
            </button>
          </div>
          <nav className={styles.overlayNav}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className={styles.navLink} onClick={close}>{label}</Link>
            ))}
            {renderCta(close)}
          </nav>
        </div>
      )}
    </header>
  )
}
