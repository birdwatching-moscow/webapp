import Image from 'next/image'
import { InfoIcon } from '@/components/icons/InfoIcon'
import { FragmentsGallery } from '@/components/BookPage/FragmentsGallery'
import type { BookFragment } from '@/types/book'
import { NoticeBanner } from '@/components/NoticeBanner/NoticeBanner'
import { TeamMemberCard } from '@/components/cards/TeamMemberCard'
import { getTeamMemberById } from '@/lib/team'
import { validPhotoUrl } from '@/utils/image'
import styles from './BookPage.module.css'

const TITLE = 'Книга «В том дереве слева»'
const DESCRIPTION = 'Книга орнитолога Вероники Самоцкой, основательницы Birdwatching Moscow'
const PHOTO_CREDIT = 'Вероника Самоцкая'
const NOTICE = 'Предположительно книга будет доступна в 2027 году'

const ABOUT_TEXT =
  'Города наполнены жизнью, которую мы часто не замечаем. Эта книга показывает, что наблюдение за птицами доступно каждому — и начинается с внимательного взгляда вокруг. В книге соединяются строгая наука и живой опыт наблюдений. Читатель постепенно учится различать птиц, узнавать их голоса, учитывать среду обитания и сезонность. Автор делится историями из полевой практики и честно говорит о сложных темах — от угроз, с которыми сталкиваются птицы, до ответственности человека перед живой природой. Книга поможет понять, как устроена жизнь птиц, и выйти на первую осознанную прогулку уже сегодня. Наблюдение за птицами — это способ вернуть себе внимание, спокойствие и ощущение живого мира вокруг.'

const FRAGMENTS: BookFragment[] = [
  { img: '/book/book-fragment-1.png', pdf: '/book/book-fragment-1.pdf', label: 'Фрагмент 1' },
  { img: '/book/book-fragment-2.png', pdf: '/book/book-fragment-2.pdf', label: 'Фрагмент 2' },
  { img: '/book/book-fragment-3.png', pdf: '/book/book-fragment-3.pdf', label: 'Фрагмент 3' },
]

export const BookPage = async () => {
  const author = await getTeamMemberById(1)

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={`text-display ${styles.heroTitle}`}>{TITLE}</h1>
          <p className={`text-body-l ${styles.heroDescription}`}>{DESCRIPTION}</p>
        </div>
        <div className={styles.heroImageWrapper}>
          <Image
            src="/images/book-cover.jpg"
            alt={TITLE}
            fill
            sizes="(min-width: 1248px) 608px, 100vw"
            className={styles.heroImage}
            priority
          />
          <span className={styles.infoIcon} aria-hidden="true">
            <InfoIcon />
          </span>
          <p className={styles.caption}>{PHOTO_CREDIT}</p>
        </div>
      </section>

      {/* Notice */}
      <section className={styles.noticeSection}>
        <NoticeBanner text={NOTICE} />
      </section>

      {/* О книге + Автор */}
      <section className={styles.contentSection}>
        <div className={styles.aboutColumn}>
          <h2 className="text-h1">О книге</h2>
          <p className={styles.aboutText}>{ABOUT_TEXT}</p>
        </div>
        <div className={styles.authorColumn}>
          <h2 className="text-h1">Автор</h2>
          {author && (
            <TeamMemberCard
              name={author.name}
              role={author.education ?? ''}
              details={author.achievements ?? ''}
              imageUrl={validPhotoUrl(author.photoUrl) ?? '/placeholders/photo-placeholder.png'}
              imageAlt={author.name}
              ebirdHref={author.profileLinks[0]}
              className={styles.authorCard}
            />
          )}
        </div>
      </section>

      {/* Фрагменты из книги */}
      <section className={styles.fragmentsSection}>
        <h2 className="text-h1">Фрагменты из книги</h2>
        <FragmentsGallery fragments={FRAGMENTS} />
      </section>
    </main>
  )
}
