import { PodcastPlayer } from './PodcastPlayer'
import styles from './HomePodcast.module.css'

const TITLE = 'Подкаст'
const DESCRIPTION =
  'Вместе с проектом Arzamas мы делали подкаст. Мы смеемся, шутим и рассказываем о птицах так, что понятно даже малышам. Если вам страшно, что вы ничего не знаете, послушайте первый выпуск про голубей.'

const YANDEX_MUSIC_URL = 'https://music.yandex.ru/album/17448287'
const APPLE_PODCAST_URL = 'https://podcasts.apple.com/ru/podcast/id1580414020'

export const HomePodcast = () => (
  <section data-testid="home-podcast" className={styles.section}>
    <div className={styles.text}>
      <h2 className={`text-h1 ${styles.title}`}>{TITLE}</h2>
      <p className={`text-body-l ${styles.description}`}>{DESCRIPTION}</p>
      <div className={styles.links}>
        <a
          href={YANDEX_MUSIC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Яндекс.Музыка
        </a>
        <a
          href={APPLE_PODCAST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Apple Podcast
        </a>
      </div>
    </div>
    <div className={styles.widget}>
      <PodcastPlayer appleClassName={styles.apple} />
    </div>
  </section>
)
