import { RequestStatus, RequestType } from '@/lib/enums'

export const STATUS_DISPLAY: Record<RequestStatus, { label: string; cls: string }> = {
  NEW:         { label: 'Новая',         cls: 'badgeNEW' },
  WAITLIST:    { label: 'Лист ожидания', cls: 'badgeWAITLIST' },
  OPEN:        { label: 'Открыта',       cls: 'badgeOPEN' },
  IN_PROGRESS: { label: 'В работе',      cls: 'badgeIN_PROGRESS' },
  CLOSED:      { label: 'Закрыта',       cls: 'badgeCLOSED' },
}

/** Selectable options in the status picker for non-expedition requests */
export const STATUS_PICKER_BASE: { value: RequestStatus; label: string; cls: string }[] = [
  { value: 'OPEN',        label: 'Открыта',  cls: 'badgeOPEN' },
  { value: 'IN_PROGRESS', label: 'В работе', cls: 'badgeIN_PROGRESS' },
  { value: 'CLOSED',      label: 'Закрыта',  cls: 'badgeCLOSED' },
]

/** Extra option prepended for expedition requests */
export const STATUS_PICKER_WAITLIST: { value: RequestStatus; label: string; cls: string } =
  { value: 'WAITLIST', label: 'Лист ожидания', cls: 'badgeWAITLIST' }

/** Options shown in the filter dropdown (excludes NEW which is set automatically) */
export const STATUS_FILTER_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'WAITLIST',    label: 'Лист ожидания' },
  { value: 'OPEN',        label: 'Открыта' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'CLOSED',      label: 'Закрыта' },
]

export const TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: 'EXPEDITION',    label: 'Экспедиция' },
  { value: 'CERTIFICATE',   label: 'Сертификат' },
  { value: 'QUESTION',      label: 'Вопрос' },
  { value: 'PRIVATE_EVENT', label: 'Частное мероприятие' },
]

export const TYPE_LABELS: Record<RequestType, string> = {
  EXPEDITION:    'Экспедиция',
  CERTIFICATE:   'Сертификат',
  QUESTION:      'Вопрос',
  PRIVATE_EVENT: 'Частное мероприятие',
}
