import { NoticeBanner } from '@/components/NoticeBanner/NoticeBanner'

const TEXT = 'За медицинской помощью для птиц обращайтесь, пожалуйста в проект Воронье гнездо'

export const VoronyeGnezdoBanner = () => (
  <NoticeBanner
    text={TEXT}
    buttons={[{ label: 'Воронье Гнездо', href: 'https://corvidsnest.ru/' }]}
  />
)
