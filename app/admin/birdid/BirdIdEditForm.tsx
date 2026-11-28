'use client'

import { useState, useTransition, useId, useCallback } from 'react'
import { Button } from '@/components/ui/buttons/Button'
import { WalkSectionDateTime } from '@/app/admin/walks/_sections/WalkSectionDateTime'
import { WalkSectionGuides } from '@/app/admin/walks/_sections/WalkSectionGuides'
import { WalkSectionTickets } from '@/app/admin/walks/_sections/WalkSectionTickets'
import { saveBirdId } from './_actions'
import type { BirdIdData } from './_actions'
import type { Guide, TicketTypeRow } from '@/app/admin/walks/_sections/types'
import { makeKey } from '@/app/admin/walks/_sections/types'
import styles from '@/app/admin/walks/[id]/walk-edit.module.css'

interface Props {
  initial: BirdIdData | null
  guides: Guide[]
}

function dataToTicketRows(
  ticketTypes: BirdIdData['ticketTypes'],
): TicketTypeRow[] {
  if (ticketTypes.length === 0) {
    return [{ key: makeKey(), name: 'Стандартный', priceRub: '', capacity: '', description: '' }]
  }
  return ticketTypes.map(t => ({
    key:         makeKey(),
    name:        t.name,
    priceRub:    t.priceKopecks != null ? String(t.priceKopecks / 100) : '',
    capacity:    String(t.capacity),
    description: t.description ?? '',
  }))
}

export const BirdIdEditForm = ({ initial, guides }: Props) => {
  const titleId = useId()

  const [title,                setTitle]                = useState(initial?.title ?? '')
  const [formUrl,              setFormUrl]              = useState(initial?.formUrl ?? '')
  const [startsAt,             setStartsAt]             = useState(initial?.startsAt ?? '')
  const [endsAt,               setEndsAt]               = useState(initial?.endsAt ?? '')
  const [schedule,             setSchedule]             = useState(initial?.schedule ?? '')
  const [seminars,             setSeminars]             = useState(initial?.seminars ?? '')
  const [registrationDeadline, setRegistrationDeadline] = useState(initial?.registrationDeadline ?? '')
  const [registrationOpen,     setRegistrationOpen]     = useState(initial?.registrationOpen ?? false)
  const [teamMemberIds,        setTeamMemberIds]        = useState<string[]>(
    (initial?.teamMemberIds ?? []).map(String)
  )
  const [tickets, setTickets] = useState<TicketTypeRow[]>(
    dataToTicketRows(initial?.ticketTypes ?? [])
  )

  const [isDirty,  setIsDirty]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)
  const [saving,   startSave]   = useTransition()

  function markDirty() {
    setIsDirty(true)
    setSuccess(false)
  }

  function isValidUrl(url: string): boolean {
    try {
      const { protocol } = new URL(url)
      return protocol === 'https:' || protocol === 'http:'
    } catch {
      return false
    }
  }

  const formUrlInvalid = formUrl.trim() !== '' && !isValidUrl(formUrl.trim())

  function getValidationErrors(): string[] {
    const errors: string[] = []
    if (!title.trim())               errors.push('Заголовок')
    if (!formUrl.trim())             errors.push('Ссылка на форму')
    else if (formUrlInvalid)         errors.push('Ссылка на форму (неверный формат)')
    if (!startsAt)                   errors.push('Дата начала курса')
    if (!endsAt)                     errors.push('Дата окончания курса')
    if (!registrationDeadline)       errors.push('Дата окончания регистрации')
    if (!schedule.trim())            errors.push('Примерное расписание')
    if (!seminars.trim())            errors.push('Семинары и лекции')
    if (teamMemberIds.length === 0)  errors.push('Команда курса')
    if (!tickets.some(t => t.name.trim() && t.priceRub !== '' && t.capacity !== '')) errors.push('Хотя бы один тип билета')
    if (tickets.length > 1 && tickets.some(t => t.name.trim() && !t.description.trim())) errors.push('Описание для каждого типа билета')
    return errors
  }

  function handleSave() {
    setError(null)
    setSuccess(false)
    if (startsAt && endsAt && endsAt < startsAt) { setError('Дата окончания курса не может быть раньше даты начала'); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    if (registrationDeadline && endsAt && registrationDeadline > endsAt) { setError('Дата окончания регистрации не может быть позднее даты окончания курса'); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    const errors = getValidationErrors()
    if (errors.length > 0) { setError(`Не заполнены обязательные поля: ${errors.join(', ')}`); window.scrollTo({ top: 0, behavior: 'smooth' }); return }

    startSave(async () => {
      try {
        await saveBirdId({
          title:                title.trim(),
          formUrl:              formUrl.trim() || null,
          startsAt:             startsAt || null,
          endsAt:               endsAt   || null,
          schedule:             schedule.trim() || null,
          seminars:             seminars.trim() || null,
          registrationDeadline: registrationDeadline || null,
          registrationOpen,
          teamMemberIds:        teamMemberIds.map(Number),
          ticketTypes: tickets
            .filter(t => t.name.trim())
            .map(t => ({
              name:         t.name.trim(),
              priceKopecks: t.priceRub !== '' ? Math.round(parseFloat(t.priceRub) * 100) : null,
              capacity:     parseInt(t.capacity, 10) || 0,
              description:  t.description.trim() || null,
            })),
        })
        setIsDirty(false)
        setSuccess(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка при сохранении')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>BirdID</h1>
        {isDirty && <span className={styles.dirtyHint}>Несохранённые изменения</span>}
      </div>

      {success && (
        <div className={styles.readonlyBanner} style={{ color: 'var(--color-success, #1f7a3b)', borderColor: 'var(--color-success, #1f7a3b)' }}>
          Сохранено
        </div>
      )}

      {error && (
        <div className={styles.readonlyBanner} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      <div className={styles.sections}>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Основное</h2>
          <div className={`${styles.fieldRow} ${styles.fieldRow2}`}>
            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label htmlFor={titleId} className={`${styles.label} ${styles.required}`}>Заголовок</label>
              <input
                id={titleId}
                className={styles.input}
                value={title}
                onChange={e => { setTitle(e.target.value); markDirty() }}
                placeholder="Например: BirdID — курс полевой идентификации птиц"
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFullWidth}`}>
              <label className={`${styles.label} ${styles.required}`}>Ссылка на форму регистрации</label>
              <input
                className={`${styles.input}${formUrlInvalid ? ` ${styles.inputError}` : ''}`}
                type="url"
                value={formUrl}
                onChange={e => { setFormUrl(e.target.value); markDirty() }}
                placeholder="https://…"
              />
              {formUrlInvalid && (
                <span className={styles.fieldError}>Введите корректный URL, начинающийся с https:// или http://</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.required}`}>Запись на курс открыта</label>
              <label className={styles.checkboxOption} style={{ marginTop: 'var(--space-1)' }}>
                <input
                  type="checkbox"
                  checked={registrationOpen}
                  onChange={e => { setRegistrationOpen(e.target.checked); markDirty() }}
                />
                Да, запись идёт
              </label>
            </div>
          </div>
        </section>

        <WalkSectionDateTime
          startsAt={startsAt}
          endsAt={endsAt}
          onStartsAt={v => { setStartsAt(v); markDirty() }}
          onEndsAt={v => { setEndsAt(v); markDirty() }}
          dateOnly
          requireAll
        />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Дата окончания регистрации</h2>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.required}`}>Принимаем заявки до</label>
              <input
                className={`${styles.input}${registrationDeadline && endsAt && registrationDeadline > endsAt ? ` ${styles.inputError}` : ''}`}
                type="date"
                value={registrationDeadline}
                onChange={e => { setRegistrationDeadline(e.target.value); markDirty() }}
              />
              {registrationDeadline && endsAt && registrationDeadline > endsAt && (
                <span className={styles.fieldError}>Дата окончания регистрации не может быть позднее даты окончания курса</span>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} ${styles.required}`}>Примерное расписание</h2>
          <div className={styles.field}>
            <textarea
              className={styles.textarea}
              value={schedule}
              onChange={e => { setSchedule(e.target.value); markDirty() }}
              rows={6}
              placeholder="Опишите расписание занятий…"
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} ${styles.required}`}>Семинары и лекции</h2>
          <div className={styles.field}>
            <textarea
              className={styles.textarea}
              value={seminars}
              onChange={e => { setSeminars(e.target.value); markDirty() }}
              rows={6}
              placeholder="Опишите темы семинаров и лекций…"
            />
          </div>
        </section>

        <WalkSectionGuides
          multi
          guides={guides}
          guideIds={teamMemberIds}
          onGuideIds={ids => { setTeamMemberIds(ids); markDirty() }}
          maxGuides={Infinity}
          sectionTitle="Команда курса"
          fieldLabel="Участники команды"
          requireGuide
        />

        <WalkSectionTickets
          tickets={tickets}
          onChange={t => { setTickets(t); markDirty() }}
          requireAll
        />

      </div>

      <div className={styles.formActions}>
        <Button fullWidth onClick={handleSave} disabled={saving || !isDirty}>
          {saving ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </div>
    </div>
  )
}
