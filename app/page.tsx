import Link from 'next/link'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/auth/permissions'
import { Hero } from '@/components/Hero/Hero'

export default async function Home() {
  const session = await auth()
  const showAdminLink = session?.user?.role != null && isAdmin(session.user.role)

  return (
    <>
      <Hero />
      {showAdminLink && (
        <Link href="/admin/walks">Админка</Link>
      )}
    </>
  )
}
