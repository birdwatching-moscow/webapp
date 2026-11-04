import Link from 'next/link'
import { auth } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/auth/permissions'
import { ROUTES } from '@/utils/routes'

const NAV_ITEMS = [
  { label: 'Прогулки',   href: ROUTES.admin.walks },
  { label: 'Экспедиции', href: ROUTES.admin.expeditions },
  { label: 'Команда',    href: ROUTES.admin.team },
  { label: 'Заявки',     href: ROUTES.admin.requests },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = session?.user?.role
  const showUsers = role != null && isSuperAdmin(role)

  return (
    <div>
      <nav>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
        {showUsers && <Link href={ROUTES.admin.users}>Пользователи</Link>}
      </nav>
      <main>{children}</main>
    </div>
  )
}
