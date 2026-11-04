import Link from 'next/link'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/auth/permissions'
import { Hero } from '@/components/Hero/Hero'
import { HomeAbout } from '@/components/HomeAbout/HomeAbout'
import { HomeWalks } from '@/components/HomeWalks/HomeWalks'
import { ROUTES } from '@/utils/routes'

export default async function Home() {
  const session = await auth()
  const showAdminLink = session?.user?.role != null && isAdmin(session.user.role)

  return (
    <>
      <Hero />
      <HomeAbout />
      <HomeWalks />
      {showAdminLink && (
        <Link href={ROUTES.admin.walks}>Админка</Link>
      )}
    </>
  )
}
