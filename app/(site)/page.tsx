import { Hero } from '@/components/Hero/Hero'
import { HomeAbout } from '@/components/HomeAbout/HomeAbout'
import { HomeWalks } from '@/components/HomeWalks/HomeWalks'
import { WalksTable } from '@/components/WalksTable/WalksTable'
import { HomeExpeditions } from '@/components/HomeExpeditions/HomeExpeditions'
import { HomePrivate } from '@/components/HomePrivate/HomePrivate'
import { HomeMedia } from '@/components/HomeMedia/HomeMedia'
import { HomePartners } from '@/components/HomePartners/HomePartners'
import { HomeBook } from '@/components/HomeBook/HomeBook'
import { HomePodcast } from '@/components/HomePodcast/HomePodcast'
import { BirdIDCTABand } from '@/components/BirdIDCTABand/BirdIDCTABand'
import { CertificateCTABand } from '@/components/CertificateCTABand/CertificateCTABand'
import { SaveBirds } from '@/components/SaveBirds/SaveBirds'
import styles from './home.module.css'
import { getActiveWalks } from '@/lib/walks'
import { getActiveExpeditions } from '@/lib/expeditions'

export default async function Home() {
  const [walks, expeditions] = await Promise.all([
    getActiveWalks({ limit: 4 }),
    getActiveExpeditions({ limit: 3 }),
  ])

  return (
    <>
      <Hero />
      <HomeAbout />
      <HomeWalks />
      <WalksTable walks={walks} showMoreButton />
      <HomeExpeditions expeditions={expeditions} />
      <HomePrivate />
      <HomeMedia />
      <HomePartners />
      <HomeBook />
      <HomePodcast />
      <section className={styles.ctaBands}>
        <BirdIDCTABand />
        <CertificateCTABand />
      </section>
      <SaveBirds />
    </>
  )
}
