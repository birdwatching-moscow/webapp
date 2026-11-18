import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero/PageHero'
import { PrivateConsultations } from '@/components/private/PrivateConsultations'
import { PrivateRequestButton } from '@/components/private/PrivateRequestButton'
import { CONSULTATION_TOPICS } from '@/lib/private/consultations'

const TITLE = 'Персональные консультации'

const INTRO = [
  'Наши эксперты — профессиональные орнитологи и опытные бёрдвотчеры — консультируют частных клиентов, организации и проекты по вопросам, связанным с бёрдвотчингом, орнитологией и птицами.',
  'Поможем спланировать самостоятельное birdwatching-путешествие, сделать территорию безопаснее и привлекательнее для птиц, разобраться с профессиональным развитием или разработать собственный проект.',
] as const

export const metadata: Metadata = {
  title: `${TITLE} | Birdwatching Moscow`,
  description: INTRO[0],
}

export default function PrivateConsultationsPage() {
  return (
    <main className="container">
      <PageHero title={TITLE} description={INTRO} action={<PrivateRequestButton />} />
      <PrivateConsultations topics={CONSULTATION_TOPICS} />
    </main>
  )
}
