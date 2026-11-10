import Link from 'next/link'
import { auth } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/auth/permissions'
import { AdminNav } from '@/components/admin/AdminNav'
import { ROUTES } from '@/utils/routes'
import styles from './layout.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = session?.user?.role
  const showUsers = role != null && isSuperAdmin(role)

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <span className={styles.brand}>Админка</span>
        <AdminNav showUsers={showUsers} />
        <Link href={ROUTES.home} className={styles.backLink}>← На сайт</Link>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  )
}
