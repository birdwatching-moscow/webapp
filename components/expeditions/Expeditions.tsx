import Image from 'next/image'
import { getActiveExpeditions } from '@/lib/expeditions'
import { ExpeditionCard } from '@/components/ExpeditionCard/ExpeditionCard'
import styles from './Expeditions.module.css'

export const Expeditions = async () => {
  const expeditions = await getActiveExpeditions()

  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.imageWrapper}>
          <div className={styles.mediaContainer}>
            <Image
              src="/placeholders/videos-placeholder.png"
              alt=""
              fill
              priority
              className={styles.image}
            />
          </div>
        </div>

        <div className={styles.text}>
          <h1 className={`text-display ${styles.heading}`}>Экспедиции</h1>

          <div className={styles.paragraphs}>
            <p className={`text-body-l ${styles.paragraph}`}>
              Многодневные выезды в заповедники, горы и побережья. Маршруты подобраны так, чтобы за неделю встретить максимальное число видов в их естественной среде — от степных орлов до морских чаек.
            </p>

            <p className={`text-body-l ${styles.paragraph}`}>
              Небольшие группы — не более 12 человек. Гиды — орнитологи с многолетним полевым опытом. Программа сочетает утренние маршруты, дневёвки для наблюдений и вечерние разборы полётов с биноклем и определителем.
            </p>

            <p className={`text-body-l ${styles.paragraph}`}>
              Экспедиции подходят участникам с любым опытом: уровень сложности указан в описании каждого маршрута.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.listings}>
        <h2 className={`text-h1 ${styles.listingsHeading}`}>Актуальные направления</h2>

        {expeditions.length === 0 ? (
          <p className={`text-body-l ${styles.empty}`}>
            Новые экспедиции скоро появятся — следите за обновлениями.
          </p>
        ) : (
          <ul className={styles.grid}>
            {expeditions.map((expedition) => (
              <li key={expedition.id} className={styles.gridItem}>
                <ExpeditionCard expedition={expedition} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
