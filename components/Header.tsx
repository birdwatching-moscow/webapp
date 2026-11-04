'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/logo/Logo'
import { ROUTES } from '@/utils/routes'
import styles from './Header.module.css'

const NAV_LINKS = [
  { label: 'Прогулки',   href: ROUTES.walks },
  { label: 'Экспедиции', href: ROUTES.expeditions },
  { label: 'Частные',    href: ROUTES.privateEvents },
  { label: 'Книга',      href: ROUTES.book },
  { label: 'О проекте',  href: ROUTES.about },
]

export const Header = () => {
  const { status } = useSession()
  const pathname = usePathname()
  // Menu is open only on the page it was opened on, so navigating closes it
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const isOpen = openedOn === pathname
  const setIsOpen = (open: boolean) => setOpenedOn(open ? pathname : null)

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
      return <Link href={ROUTES.login} className={styles.cta} onClick={onClick}>Войти</Link>
    }
    if (pathname === ROUTES.profile) {
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
    return <Link href={ROUTES.profile} className={styles.cta} onClick={onClick}>Личный кабинет</Link>
  }

  return (
    <header className={styles.header}>
      <Link href="/"><Logo /></Link>

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
        <span className={styles.bar} />
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.overlayHeader}>
            <Link href="/" onClick={close}><Logo /></Link>
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
