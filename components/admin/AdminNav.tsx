'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@/utils/routes'
import styles from './AdminNav.module.css'

const PRIMARY = [
  { label: 'Прогулки',   href: ROUTES.admin.walks },
  { label: 'Экспедиции', href: ROUTES.admin.expeditions },
  { label: 'Заявки',     href: ROUTES.admin.requests },
]

const SECONDARY = [
  { label: 'Команда', href: ROUTES.admin.team },
]

type Props = { showUsers: boolean }

export const AdminNav = ({ showUsers }: Props) => {
  const pathname = usePathname()

  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={[styles.item, pathname.startsWith(href) ? styles.active : ''].filter(Boolean).join(' ')}
    >
      {label}
    </Link>
  )

  return (
    <nav className={styles.nav}>
      <div className={styles.group}>
        {PRIMARY.map(({ href, label }) => link(href, label))}
      </div>
      <div className={styles.divider} />
      <div className={styles.group}>
        {SECONDARY.map(({ href, label }) => link(href, label))}
        {showUsers && link(ROUTES.admin.users, 'Пользователи')}
      </div>
    </nav>
  )
}
