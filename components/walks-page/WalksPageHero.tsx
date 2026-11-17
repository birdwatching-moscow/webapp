import Image from 'next/image'
import styles from './WalksPageHero.module.css'

export const WalksPageHero = () => (
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
      <h1 className={`text-display ${styles.heading}`}>Прогулки по Москве</h1>

      <div className={styles.paragraphs}>
        <p className={`text-body-l ${styles.paragraph}`}>
          Прогулки проходят каждые выходные и длятся 1,5–2 часа. Лёгкий формат для первого знакомства с птицами — и повод возвращаться на природу в хорошей компании.
        </p>

        <p className={`text-body-l ${styles.paragraph}`}>
          Занятия на природе построены по принципу полевой практики у студентов, обучающихся на биологическом факультете МГУ им. М.В. Ломоносова. Во время прогулок вы пройдёте по маршруту, на котором гид познакомит вас с живыми существами в их естественной среде обитания, расскажет об их биологии и месте в экосистемах.
        </p>

        <p className={`text-body-l ${styles.paragraph}`}>
          Например, на прогулке по орнитологии гид укажет птиц, которые встретятся на пути, научит отличать разные виды по внешности, голосам и повадкам, расскажет о биотопах, которые они населяют, по возможности покажет их гнёзда и ответит на вопросы о биологии птиц в целом.
        </p>
      </div>
    </div>
  </section>
)
