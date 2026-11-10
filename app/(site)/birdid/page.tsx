import type { Metadata } from 'next'
import { CTABand } from '@/components/CTABand/CTABand'
import { ROUTES } from '@/utils/routes'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'BirdID | Birdwatching Moscow',
  description: 'Бердвотчинг в Москве, экспедиции по России и за границей',
}

export default function BirdIDPage() {
  return (
    <main className="container">
      <h1>BirdID</h1>
      <div className={styles.bands}>
        <CTABand
          title="BirdID — курс идентификации птиц"
          description="Углублённый курс с апреля по середину июля, по выходным и в поле. После экзаменов — сертификат и возможность проводить учёты, волонтёрить и работать в заповедниках."
          buttonLabel="Узнать о курсе"
          href={ROUTES.birdid}
        />
        <CTABand
          title="Сертификат"
          description="Удобный подарок для друзей, коллег, родственников и других близких!"
          buttonLabel="Подробнее"
          href={ROUTES.certificates}
        />
      </div>
    </main>
  )
}
