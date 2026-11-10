'use client'

import { useState, useEffect, useTransition, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/buttons/Button'
import { Modal } from '@/components/ui/modal/Modal'
import { updateWalkFull, publishWalk, cancelWalk, deleteWalk } from '@/app/admin/walks/_actions'
import { ROUTES } from '@/utils/routes'
import type { Guide, TicketTypeRow } from '@/app/admin/walks/_sections/types'
import { makeKey } from '@/app/admin/walks/_sections/types'
import { WalkSectionMain } from '@/app/admin/walks/_sections/WalkSectionMain'
import { WalkSectionDateTime } from '@/app/admin/walks/_sections/WalkSectionDateTime'
import { WalkSectionGuides } from '@/app/admin/walks/_sections/WalkSectionGuides'
import { WalkSectionCover } from '@/app/admin/walks/_sections/WalkSectionCover'
import { WalkSectionTickets } from '@/app/admin/walks/_sections/WalkSectionTickets'
import { WalkEmailTab } from '@/app/admin/walks/_sections/WalkEmailTab'
import styles from './walk-edit.module.css'

type WalkData = {
  id: string
  title: string
  subtitle: string | null
  description: string
  startsAt: string
  endsAt: string
  location: string
  coverPhotoUrl: string
  guideId: number
  guideId2: number | null
  status: string
  purchaseEmailSubject: string | null
  purchaseEmailBody: string | null
  emailSubject: string | null
  emailBody: string | null
  reminderDaysBefore: number | null
  ticketTypes: { name: string; priceKopecks: number | null; capacity: number }[]
}

interface Props {
  walk: WalkData
  guides: Guide[]
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Черновик',
  ACTIVE: 'Активна',
  CANCELLED: 'Отменена',
  PAST: 'Прошла',
}

function statusBadgeClass(status: string) {
  if (status === 'DRAFT')     return styles.badgeDRAFT
  if (status === 'ACTIVE')    return styles.badgeACTIVE
  if (status === 'CANCELLED') return styles.badgeCANCELLED
  return styles.badgePAST
}

function initialTickets(types: WalkData['ticketTypes']): TicketTypeRow[] {
  if (types.length === 0) return [{ key: makeKey(), name: 'Стандартный', priceRub: '', capacity: '' }]
  return types.map(t => ({
    key: makeKey(),
    name: t.name,
    priceRub: t.priceKopecks != null ? String(t.priceKopecks / 100) : '',
    capacity: String(t.capacity),
  }))
}

export function WalkEditForm({ walk, guides }: Props) {
  const router = useRouter()
  const isEditable = walk.status === 'ACTIVE' || walk.status === 'DRAFT'

  const [title, setTitle]       = useState(walk.title)
  const [subtitle, setSubtitle] = useState(walk.subtitle ?? '')
  const [description, setDescription] = useState(walk.description)
  const [startsAt, setStartsAt] = useState(walk.startsAt)
  const [endsAt, setEndsAt]     = useState(walk.endsAt)
  const [location, setLocation] = useState(walk.location)
  const [coverUrl, setCoverUrl]         = useState(walk.coverPhotoUrl)
  const [guideId, setGuideId]           = useState(String(walk.guideId))
  const [guideId2, setGuideId2]         = useState(walk.guideId2 ? String(walk.guideId2) : '')
  const [tickets, setTickets]           = useState<TicketTypeRow[]>(() => initialTickets(walk.ticketTypes))
  const [purchaseEmailSubject, setPurchaseEmailSubject] = useState(walk.purchaseEmailSubject ?? '')
  const [purchaseEmailBody, setPurchaseEmailBody]       = useState(walk.purchaseEmailBody ?? '')
  const [emailSubject, setEmailSubject] = useState(walk.emailSubject ?? '')
  const [emailBody, setEmailBody]       = useState(walk.emailBody ?? '')
  const [reminderDaysBefore, setReminderDaysBefore] = useState(walk.reminderDaysBefore ?? 1)
  const [formTab, setFormTab]           = useState<'walk' | 'email'>('walk')

  const [isDirty, setIsDirty]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showDangerConfirm, setShowDangerConfirm] = useState<'cancel' | 'delete' | null>(null)
  const [saving, startSave]     = useTransition()
  const [publishing, startPublish] = useTransition()
  const [danger, startDanger]   = useTransition()

  const titleId = useId()
  const requireAll = walk.status === 'ACTIVE'

  function markDirty() { setIsDirty(true) }

  function getPublishErrors(): string[] {
    const errors: string[] = []
    if (!subtitle.trim()) errors.push('Подзаголовок')
    if (!description.trim()) errors.push('Описание')
    if (!startsAt) errors.push('Дата начала')
    if (!endsAt) errors.push('Дата окончания')
    if (!location.trim()) errors.push('Локация')
    if (!guideId) errors.push('Гид')
    if (!coverUrl.trim()) errors.push('URL фото')
    if (!tickets.some(t => t.name.trim() !== '' && t.priceRub !== '' && t.capacity !== '')) errors.push('хотя бы один билет с названием, ценой и количеством')
    if (!purchaseEmailSubject.trim()) errors.push('Тема письма при покупке')
    if (!purchaseEmailBody.trim()) errors.push('Текст письма при покупке')
    return errors
  }

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  function walksListHref() {
    if (walk.status === 'DRAFT') return `${ROUTES.admin.walks}?tab=draft`
    if (walk.status === 'ACTIVE') return ROUTES.admin.walks
    return `${ROUTES.admin.walks}?tab=all`
  }

  function handleBack() {
    if (isDirty) { setShowLeaveConfirm(true); return }
    router.push(walksListHref())
  }

  function confirmLeave() {
    setShowLeaveConfirm(false)
    router.push(walksListHref())
  }

  function buildPayload() {
    return {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim(),
      startsAt,
      endsAt: endsAt || undefined,
      location: location.trim(),
      coverPhotoUrl: coverUrl.trim(),
      guideId: Number(guideId),
      guideId2: guideId2 ? Number(guideId2) : undefined,
      purchaseEmailSubject: purchaseEmailSubject.trim() || undefined,
      purchaseEmailBody: purchaseEmailBody.trim() || undefined,
      emailSubject: emailSubject.trim() || undefined,
      emailBody: emailBody.trim() || undefined,
      reminderDaysBefore,
      ticketTypes: tickets.map(t => ({
        name: t.name.trim() || 'Без названия',
        priceKopecks: t.priceRub !== '' ? Math.round(parseFloat(t.priceRub) * 100) : null,
        capacity: parseInt(t.capacity, 10) || 0,
      })),
    }
  }

  function handleSave() {
    setError(null)
    if (walk.status === 'ACTIVE') {
      const errors = getPublishErrors()
      if (errors.length > 0) {
        setError(`Не заполнены обязательные поля: ${errors.join(', ')}`)
        return
      }
    } else {
      if (!title.trim()) { setError('Название обязательно'); return }
    }
    startSave(async () => {
      try {
        await updateWalkFull(walk.id, buildPayload())
        setIsDirty(false)
        router.push(walksListHref())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при сохранении')
      }
    })
  }

  function handlePublish() {
    setError(null)
    if (!title.trim()) { setError('Название обязательно'); return }
    const errors = getPublishErrors()
    if (errors.length > 0) {
      setError(`Нельзя опубликовать: не заполнены — ${errors.join(', ')}`)
      return
    }
    startPublish(async () => {
      try {
        await publishWalk(walk.id)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при публикации')
      }
    })
  }

  function confirmDanger() {
    const action = showDangerConfirm
    setShowDangerConfirm(null)
    startDanger(async () => {
      try {
        if (action === 'cancel') await cancelWalk(walk.id)
        else await deleteWalk(walk.id)
        router.push(ROUTES.admin.walks)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка')
      }
    })
  }

  return (
    <div className={styles.page}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={handleBack}>
          ← Прогулки
        </button>
        <div className={styles.topBarRight}>
          <span className={[styles.badge, statusBadgeClass(walk.status)].join(' ')}>
            {STATUS_LABELS[walk.status] ?? walk.status}
          </span>
          {isDirty && <span className={styles.dirtyHint}>Несохранённые изменения</span>}
          {isEditable && (
            <Button size="sm" variant="outline" onClick={handleSave} disabled={saving || !isDirty}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </Button>
          )}
          {walk.status === 'DRAFT' && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={publishing || isDirty}
              title={isDirty ? 'Сначала сохраните изменения' : undefined}
            >
              {publishing ? 'Публикация…' : 'Опубликовать'}
            </Button>
          )}
        </div>
      </div>

      {!isEditable && (
        <div className={styles.readonlyBanner}>
          Эта прогулка доступна только для просмотра — редактирование возможно только в статусах «Черновик» и «Активна».
        </div>
      )}

      {error && (
        <div className={styles.readonlyBanner} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      <nav className={styles.formTabs}>
        <button
          type="button"
          className={[styles.formTab, formTab === 'walk' ? styles.formTabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setFormTab('walk')}
        >
          Описание прогулки
        </button>
        <button
          type="button"
          className={[styles.formTab, formTab === 'email' ? styles.formTabActive : ''].filter(Boolean).join(' ')}
          onClick={() => setFormTab('email')}
        >
          Email
        </button>
      </nav>

      {formTab === 'walk' && (
        <div className={styles.sections}>
          <WalkSectionMain
            titleId={titleId}
            title={title} subtitle={subtitle} description={description}
            onTitle={v => { setTitle(v); markDirty() }}
            onSubtitle={v => { setSubtitle(v); markDirty() }}
            onDescription={v => { setDescription(v); markDirty() }}
            disabled={!isEditable}
            requireAll={requireAll}
          />
          <WalkSectionDateTime
            startsAt={startsAt} endsAt={endsAt} location={location}
            onStartsAt={v => { setStartsAt(v); markDirty() }}
            onEndsAt={v => { setEndsAt(v); markDirty() }}
            onLocation={v => { setLocation(v); markDirty() }}
            disabled={!isEditable}
            requireAll={requireAll}
          />
          <WalkSectionGuides
            guides={guides} guideId={guideId} guideId2={guideId2}
            onGuideId={v => { setGuideId(v); markDirty() }}
            onGuideId2={v => { setGuideId2(v); markDirty() }}
            disabled={!isEditable}
            requireAll={requireAll}
          />
          <WalkSectionCover
            coverUrl={coverUrl}
            onCoverUrl={v => { setCoverUrl(v); markDirty() }}
            disabled={!isEditable}
            requireAll={requireAll}
          />
          <WalkSectionTickets
            tickets={tickets}
            onChange={t => { setTickets(t); markDirty() }}
            disabled={!isEditable}
            requireAll={requireAll}
          />
        </div>
      )}

      {formTab === 'email' && (
        <WalkEmailTab
          purchaseEmailSubject={purchaseEmailSubject}
          purchaseEmailBody={purchaseEmailBody}
          emailSubject={emailSubject}
          emailBody={emailBody}
          reminderDaysBefore={reminderDaysBefore}
          onPurchaseEmailSubject={v => { setPurchaseEmailSubject(v); markDirty() }}
          onPurchaseEmailBody={v => { setPurchaseEmailBody(v); markDirty() }}
          onEmailSubject={v => { setEmailSubject(v); markDirty() }}
          onEmailBody={v => { setEmailBody(v); markDirty() }}
          onReminderDaysBefore={v => { setReminderDaysBefore(v); markDirty() }}
          disabled={!isEditable}
          requireAll={requireAll}
        />
      )}

      {(walk.status === 'ACTIVE' || walk.status === 'DRAFT') && (
        <div className={styles.dangerZone}>
          {walk.status === 'ACTIVE' && (
            <button type="button" className={styles.dangerBtn} onClick={() => setShowDangerConfirm('cancel')} disabled={danger}>
              Отменить прогулку
            </button>
          )}
          {walk.status === 'DRAFT' && (
            <button type="button" className={styles.dangerBtn} onClick={() => setShowDangerConfirm('delete')} disabled={danger}>
              Удалить черновик
            </button>
          )}
        </div>
      )}

      <Modal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        title="Несохранённые изменения"
        footer={
          <div className={styles.leaveModalFooter}>
            <Button fullWidth variant="secondary" onClick={() => setShowLeaveConfirm(false)}>Отмена</Button>
            <Button fullWidth variant="destructive" onClick={confirmLeave}>Уйти без сохранения</Button>
          </div>
        }
      >
        <p className={styles.leaveModalText}>
          Вы внесли изменения, которые ещё не сохранены. Если уйти сейчас — они потеряются.
        </p>
      </Modal>

      <Modal
        open={showDangerConfirm !== null}
        onClose={() => setShowDangerConfirm(null)}
        title={showDangerConfirm === 'cancel' ? 'Отменить прогулку?' : 'Удалить черновик?'}
        footer={
          <div className={styles.leaveModalFooter}>
            <Button fullWidth variant="secondary" onClick={() => setShowDangerConfirm(null)}>Назад</Button>
            <Button fullWidth variant="destructive" onClick={confirmDanger} disabled={danger}>
              {showDangerConfirm === 'cancel' ? 'Отменить прогулку' : 'Удалить'}
            </Button>
          </div>
        }
      >
        <p className={styles.leaveModalText}>
          {showDangerConfirm === 'cancel'
            ? 'Прогулка перейдёт в статус «Отменена». Участники не будут уведомлены автоматически.'
            : 'Черновик будет удалён без возможности восстановления.'}
        </p>
      </Modal>
    </div>
  )
}
