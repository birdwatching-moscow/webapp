import { PRIVATE_PARKS } from '@/lib/private/parks'
import { PRIVATE_LECTURES } from '@/lib/private/lectures'
import { CONSULTATION_TOPICS } from '@/lib/private/consultations'
import { SectionIntro } from '@/components/SectionIntro/SectionIntro'
import { LocationCard } from '@/components/cards/LocationCard'
import { LectureVideoCard } from '@/components/private/LectureVideoCard'
import { PrivateTopicCard } from '@/components/private/PrivateTopicCard'
import { Button } from '@/components/ui/buttons/Button'
import { VoronyeGnezdoBanner } from '@/components/VoronyeGnezdoBanner/VoronyeGnezdoBanner'
import { ROUTES } from '@/utils/routes'
import styles from './Private.module.css'

const PREVIEW_PARKS = PRIVATE_PARKS.slice(0, 3)
const PREVIEW_LECTURES = PRIVATE_LECTURES.slice(0, 2)
const PREVIEW_TOPICS = CONSULTATION_TOPICS.slice(0, 3)

const PARKS_DESCRIPTION =
  'Прогулки в Москве проходят каждые выходные и длятся 1,5–2 часа. Такой лёгкий формат идеален для первого знакомства с птицами, а многие приходят регулярно, потому что им нравится отдыхать от городской суеты и проводить время на природе в хорошей компании.'

const LECTURES_DESCRIPTION = [
  'Пригласите эксперта Birdwatching Moscow провести лекцию о птицах, бёрдвотчинге и городской природе.',
  'Проводим лекции для компаний, школ, библиотек, музеев, образовательных и культурных проектов. Тему и формат можем подобрать под вашу аудиторию и задачу.',
] as const

const CONSULTATIONS_DESCRIPTION = [
  'Наши эксперты — профессиональные орнитологи и опытные бёрдвотчеры — консультируют частных клиентов, организации и проекты по вопросам, связанным с бёрдвотчингом, орнитологией и птицами.',
  'Поможем спланировать самостоятельное birdwatching-путешествие, сделать территорию безопаснее и привлекательнее для птиц, разобраться с профессиональным развитием или разработать собственный проект.',
] as const

export const Private = () => (
  <main className={`container ${styles.page}`}>
    <section className={styles.hero}>
      <h1 className={`text-display ${styles.heroTitle}`}>Частные события</h1>
      <p className={`text-body-l ${styles.heroDescription}`}>
        Хотите отправиться на прогулку за птицами своей компанией, пригласить нас с лекцией или получить консультацию эксперта? Выберите подходящий формат — мы поможем организовать его под ваш запрос.
      </p>
    </section>

    <section className={styles.section} aria-label="Прогулки по Москве">
      <SectionIntro title="Прогулки по Москве" description={PARKS_DESCRIPTION} />
      <ul className={styles.swipeGrid}>
        {PREVIEW_PARKS.map((park) => (
          <li key={park.name} className={styles.swipeItem}>
            <LocationCard
              name={park.name}
              description={park.description}
              species={park.species}
              imageUrl={park.imageUrl}
              photoCredit={park.photoCredit}
              imageAlt={park.name}
            />
          </li>
        ))}
      </ul>
      <Button as="a" href={ROUTES.privateParks} size="lg" fullWidth className={styles.cta}>
        Подробнее
      </Button>
    </section>

    <section className={styles.section} aria-label="Лекции">
      <SectionIntro title="Лекции" description={LECTURES_DESCRIPTION} />
      <ul className={styles.stackGrid}>
        {PREVIEW_LECTURES.map((lecture, index) => (
          <li key={`${index}-${lecture.title}`}>
            <LectureVideoCard
              title={lecture.title}
              subtitle={lecture.subtitle}
              videoUrl={lecture.videoUrl}
              previewUrl={lecture.previewUrl}
              info={lecture.info}
            />
          </li>
        ))}
      </ul>
      <Button as="a" href={ROUTES.privateLectures} size="lg" fullWidth className={styles.cta}>
        Подробнее
      </Button>
    </section>

    <section className={styles.section} aria-label="Персональные консультации">
      <SectionIntro title="Персональные консультации" description={CONSULTATIONS_DESCRIPTION} />
      <ul className={styles.swipeGrid}>
        {PREVIEW_TOPICS.map((topic) => (
          <li key={topic.title} className={styles.swipeItem}>
            <PrivateTopicCard topic={topic} />
          </li>
        ))}
      </ul>
      <Button as="a" href={ROUTES.privateConsultations} size="lg" fullWidth className={styles.cta}>
        Подробнее
      </Button>
    </section>

    <div className={styles.notice}>
      <VoronyeGnezdoBanner />
    </div>
  </main>
)
