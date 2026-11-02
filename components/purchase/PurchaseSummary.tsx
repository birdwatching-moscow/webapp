import { formatKopecksRu } from '@/utils/formatMoney'
import { pluralRu } from '@/utils/pluralRu'
import styles from './PurchaseSummary.module.css'

type PurchaseSummaryProps = {
  walkTitle: string
  walkDate: Date
  walkLocation: string
  quantity: number
  unitPriceKopecks: number
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Moscow',
})

export const PurchaseSummary = ({
  walkTitle,
  walkDate,
  walkLocation,
  quantity,
  unitPriceKopecks,
  className,
}: PurchaseSummaryProps) => {
  const formattedDate = dateFormatter.format(walkDate)
  const quantityLabel = pluralRu(quantity, ['билет', 'билета', 'билетов'])
  const unitPrice = formatKopecksRu(unitPriceKopecks)
  const totalPrice = formatKopecksRu(quantity * unitPriceKopecks)

  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      <h3 className="text-h3">{walkTitle}</h3>
      <p className="text-body">{formattedDate}</p>
      <p className="text-body">{walkLocation}</p>
      <p className="text-body">{quantityLabel}</p>
      <p className="text-body">{unitPrice}</p>
      <p className="text-body-l">{totalPrice}</p>
    </div>
  )
}
