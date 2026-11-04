import Link from 'next/link'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/auth/permissions'
import { Hero } from '@/components/Hero/Hero'
import { HomeAbout } from '@/components/HomeAbout/HomeAbout'
import { HomeWalks } from '@/components/HomeWalks/HomeWalks'
import { WalksTable } from '@/components/WalksTable/WalksTable'
import { getActiveWalks } from '@/lib/walks'
import { ROUTES } from '@/utils/routes'

export default async function Home() {
  const [session, walks] = await Promise.all([
    auth(),
    getActiveWalks({ limit: 4 }),
  ])
  const showAdminLink = session?.user?.role != null && isAdmin(session.user.role)

  return (
    <>
      <Hero />
      <HomeAbout />
      <HomeWalks />
      <WalksTable walks={walks} showMoreButton={walks.length > 0} />
      {showAdminLink && (
        <Link href={ROUTES.admin.walks}>Админка</Link>
      )}
    </>
  )
}
