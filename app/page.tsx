import { Hero } from '@/components/Hero/Hero'
import { HomeAbout } from '@/components/HomeAbout/HomeAbout'
import { HomeWalks } from '@/components/HomeWalks/HomeWalks'
import { WalksTable } from '@/components/WalksTable/WalksTable'
import { getActiveWalks } from '@/lib/walks'

export default async function Home() {
  const walks = await getActiveWalks({ limit: 4 })

  return (
    <>
      <Hero />
      <HomeAbout />
      <HomeWalks />
      <WalksTable walks={walks} showMoreButton={walks.length > 0} />
    </>
  )
}
