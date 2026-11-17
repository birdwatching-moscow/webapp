import { Review } from '@/components/cards/Review'
import styles from './WalksReviews.module.css'

export const WalksReviews = () => (
  <section className={styles.section}>
    <h2 className={`text-h1 ${styles.heading}`}>Отзывы участников</h2>

    <div className={styles.grid}>
      <Review
        authorName="anna.gorban.169"
        body="«Моя первая встреча с совой. Спасибо @birdwatching_moscow за экскурсию. Самостоятельно найти это чудо просто невозможно. Даже когда знающий человек показал на неё пальцем, разглядеть сову на фоне веток удаётся далеко не сразу. Вообще удивительно — сколько видов птиц живёт совсем рядом с нами, а большинство людей их не замечает.»"
        href="https://www.scipeople.net/"
      />
    </div>
  </section>
)
