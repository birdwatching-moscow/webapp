import type { Metadata } from 'next'
import { PhotoCard } from '@/components/PhotoCard/PhotoCard'
import { BirdIdHeroInfo } from '@/components/birdid/BirdIdHeroInfo'
import { BirdIdTextSection } from '@/components/birdid/BirdIdTextSection'
import { BirdIdPhotoRow } from '@/components/birdid/BirdIdPhotoRow'
import { PrivateHighlights, type PrivateHighlight } from '@/components/private/PrivateHighlights'
import { AlertBanner } from '@/components/AlertBanner/AlertBanner'
import { getBirdIdPublic } from '@/lib/birdid'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'BirdID | Birdwatching Moscow',
  description: 'Бердвотчинг в Москве, экспедиции по России и за границей',
}

const ABOUT_HIGHLIGHTS: readonly PrivateHighlight[] = [
  {
    title: 'Продолжительность',
    description: 'Ожидаемая продолжительность курса: 181 час. Выезды по выходным с 4 апреля по 7 июня. Лекции и семинары по вечерам в будни',
  },
  {
    title: 'Что будем делать?',
    description: 'Посещаем различные местообитания птиц и учимся определять их в природе по внешнему виду и голосу',
  },
  {
    title: 'Сложность',
    description: 'Долгие пешие переходы, переезды на авто и общественном транспорте. Ночевки в разных условиях от гостевого домика до палатки',
  },
]

export default async function BirdIDPage() {
  const birdId = await getBirdIdPublic()

  return (
    <main className="container">
      <PhotoCard
        src="/images/birdid/birdid-hero.webp"
        alt="Участники курса BirdID наблюдают за птицами"
        caption="Фото: Ольга Ерёменко, BirdId-2022"
        priority
      />

      {birdId && (
        <BirdIdHeroInfo
          title={birdId.title}
          formUrl={birdId.formUrl}
          startsAt={birdId.startsAt}
          endsAt={birdId.endsAt}
          durationDays={birdId.durationDays}
          durationHours={birdId.durationHours}
          difficulty={birdId.difficulty}
          registrationOpen={birdId.registrationOpen}
        />
      )}

      <PrivateHighlights title="Коротко о курсе" highlights={ABOUT_HIGHLIGHTS} />

      <AlertBanner text="Вставать придётся в 5 утра, ходить по 10+ км! В выходные!" className={styles.alert} />

      <BirdIdTextSection
        title="Что такое курс BirdID и кому он подходит?"
        paragraphs={[
          'BirdID — это углублённый курс полевой идентификации птиц. Он подходит для тех, кто всерьёз увлёкся птицами и хочет развиваться в этом направлении. Ваш уровень не важен, будет интересно и новичкам, и продвинутым бёрдвотчерам, и даже специалистам-биологам. На курсе вы научитесь профессионально определять птиц по внешнему виду и голосу, проводить учёты и вносить данные в базы наблюдений. После курса вы сможете волонтёрить и даже работать в заповедниках и помогать учёным в экспедициях.',
          'Курс длится с середины апреля по середину июня и проходит по выходным. Занятия занимают целый день, а иногда и несколько дней. Вам придётся столкнуться со всеми сложностями интенсивной полевой работы: подъёмы в 5 утра, пешие походы больше 10 км и все превратности погоды — наши постоянные спутники. После курса вы сдаёте экзамены и получаете сертификат.',
        ]}
      />

      <BirdIdPhotoRow />

      <BirdIdTextSection
        title="Как проходит курс BirdID?"
        paragraphs={[
          <>BirdID — это полноценный университетский курс, разработанный{' '}<a href="https://www.nord.no" target="_blank" rel="noopener noreferrer">норвежским университетом Nord</a>. В России наша команда проводит курс BirdID с 2017 года и уже выпустила семь потоков студентов.</>,
          'Цель курса — подготовка специалистов для участия в программах по учёту и мониторингу птиц и научных работах.',
          'Для записи на курс нужно пройти собеседование и вступительный тест онлайн. Его результаты ни на что не влияют, он нужен нам для определения вашего уровня и чтобы отследить динамику обучения. Для получения сертификата после окончания курса нужно сдать итоговый экзамен онлайн и полевой очный зачет.',
          'Занятия проходят в каждые выходные дни с 4 апреля по 7 июня в Москве, Подмосковье и его окрестностях — в парках, лесопарках, заказниках и заповедниках. В 2026 году планируется два больших выезда на три дня: в Окский заповедник и Смоленское Поозерье. Всего планируется провести 22 занятий, 4 семинара и 4 лекции. Длительность полевого занятия — около 5 часов в Москве и бесконечность на выездах. В зависимости от погодных условий длительность отдельного занятия может варьироваться.',
        ]}
      />
    </main>
  )
}
