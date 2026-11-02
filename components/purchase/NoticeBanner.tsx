import styles from './NoticeBanner.module.css'

export type NoticeBannerState =
  | 'SoldOut' | 'Checking' | 'Canceled'
  | 'WidgetFirst' | 'WidgetRepeated' | 'Unavailable'
  | 'Declined' | 'Expired' | 'CheckingStopped'

type NoticeBannerProps = {
  state: NoticeBannerState
  action?: React.ReactNode
  className?: string
}

const ERROR_STATES = new Set<NoticeBannerState>([
  'WidgetFirst', 'WidgetRepeated', 'Unavailable',
  'Declined', 'Expired', 'CheckingStopped',
])

const MESSAGES: Record<NoticeBannerState, string> = {
  SoldOut:         'Места на это мероприятие закончились.',
  Checking:        'Проверяем оплату…',
  Canceled:        'Бронирование отменено.',
  WidgetFirst:     'Не удалось обработать платёж. Попробуйте ещё раз.',
  WidgetRepeated:  'Платёж снова не прошёл. Проверьте данные карты.',
  Unavailable:     'Оплата временно недоступна.',
  Declined:        'Платёж отклонён банком.',
  Expired:         'Время оплаты истекло.',
  CheckingStopped: 'Проверка статуса платежа остановлена.',
}

export const NoticeBanner = ({ state, action, className }: NoticeBannerProps) => {
  const isError = ERROR_STATES.has(state)
  const cls = [
    styles.banner,
    isError ? styles.error : styles.neutral,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <p className={styles.message}>{MESSAGES[state]}</p>
      {action}
    </div>
  )
}
