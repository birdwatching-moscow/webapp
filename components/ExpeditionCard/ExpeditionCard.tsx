import { InfoCard } from '@/components/InfoCard/InfoCard'
import { ROUTES } from '@/utils/routes'
import { formatExpeditionDate } from '@/utils/formatExpeditionDate'
import type { ExpeditionCardRow } from '@/lib/expeditions'

interface ExpeditionCardProps {
  expedition: ExpeditionCardRow
}

export const ExpeditionCard = ({ expedition }: ExpeditionCardProps) => (
  <InfoCard
    href={ROUTES.expedition(expedition.slug)}
    imageSrc={expedition.coverPhotoUrl}
    imageAlt={expedition.title}
    label={formatExpeditionDate(expedition.startsAt, expedition.endsAt)}
    title={expedition.title}
    description={expedition.description}
  />
)
