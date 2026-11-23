import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, walkMock, ticketMock, ticketTypeMock, $transactionMock } = vi.hoisted(() => {
  const $transactionMock = vi.fn((ops: unknown[]) => Promise.all(ops))
  return {
    authMock: vi.fn(),
    walkMock: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    ticketMock: { count: vi.fn() },
    ticketTypeMock: { deleteMany: vi.fn().mockResolvedValue({}), createMany: vi.fn().mockResolvedValue({}) },
    $transactionMock,
  }
})

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/prisma', () => ({
  prisma: { walk: walkMock, ticket: ticketMock, ticketType: ticketTypeMock, $transaction: $transactionMock },
}))

import {
  updateWalkFull,
  cancelWalk,
  publishWalk,
  deleteWalk,
  reactivateWalk,
} from '@/app/admin/walks/_actions'
import { EventStatus } from '@/generated/prisma/client'

const ADMIN_SESSION = { user: { id: 'u1', role: 'ADMIN' as const, name: 'Admin' } }
const FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
const PAST = new Date(Date.now() - 60 * 60 * 1000).toISOString()

beforeEach(() => {
  vi.clearAllMocks()
  authMock.mockResolvedValue(ADMIN_SESSION)
})

describe('publishWalk', () => {
  it('throws "Прогулка уже опубликована" when status is already ACTIVE', async () => {
    walkMock.findFirst.mockResolvedValue({ id: 'walk-1', status: EventStatus.ACTIVE })
    await expect(publishWalk('walk-1')).rejects.toThrow('Прогулка уже опубликована')
  })
})

describe('deleteWalk', () => {
  it('throws when ticket count is greater than 0', async () => {
    walkMock.findFirst.mockResolvedValue({ id: 'walk-1', status: EventStatus.DRAFT })
    ticketMock.count.mockResolvedValue(1)
    await expect(deleteWalk('walk-1')).rejects.toThrow(/проданными билетами/)
  })

  it('calls walk.update with status DELETED when no tickets sold', async () => {
    walkMock.findFirst.mockResolvedValue({ id: 'walk-1', status: EventStatus.DRAFT })
    ticketMock.count.mockResolvedValue(0)
    walkMock.update.mockResolvedValue({ id: 'walk-1', status: 'DELETED' })
    await deleteWalk('walk-1')
    expect(walkMock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DELETED' }),
      })
    )
  })
})

describe('cancelWalk', () => {
  it('throws when walk status is not ACTIVE', async () => {
    walkMock.findFirst.mockResolvedValue({ id: 'walk-1', status: EventStatus.DRAFT })
    await expect(cancelWalk('walk-1')).rejects.toThrow()
  })

  it('calls walk.update with CANCELLED when walk is ACTIVE', async () => {
    walkMock.findFirst.mockResolvedValue({ id: 'walk-1', status: EventStatus.ACTIVE })
    walkMock.update.mockResolvedValue({ id: 'walk-1', status: EventStatus.CANCELLED })
    await cancelWalk('walk-1')
    expect(walkMock.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: EventStatus.CANCELLED }) })
    )
  })
})

describe('reactivateWalk', () => {
  it('throws when walk status is not CANCELLED', async () => {
    walkMock.findFirst.mockResolvedValue({ id: 'walk-1', status: EventStatus.DRAFT, startsAt: new Date(FUTURE) })
    await expect(reactivateWalk('walk-1')).rejects.toThrow('Прогулка не отменена')
  })

  it('throws when start time is in the past', async () => {
    walkMock.findFirst.mockResolvedValue({ id: 'walk-1', status: EventStatus.CANCELLED, startsAt: new Date(PAST) })
    await expect(reactivateWalk('walk-1')).rejects.toThrow(/время прогулки уже прошло/)
  })

  it('sets status to ACTIVE when CANCELLED and start time is in the future', async () => {
    walkMock.findFirst.mockResolvedValue({ id: 'walk-1', status: EventStatus.CANCELLED, startsAt: new Date(FUTURE) })
    walkMock.update.mockResolvedValue({})
    await reactivateWalk('walk-1')
    expect(walkMock.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: EventStatus.ACTIVE }) })
    )
  })
})


const FULL_PAYLOAD = {
  title: 'Утки на пруду',
  subtitle: 'Осенний маршрут',
  description: 'Описание',
  startsAt: FUTURE,
  endsAt: FUTURE,
  location: 'Парк',
  coverPhotoUrl: 'https://example.com/cover.jpg',
  guideId: 1,
  emailSubject: 'Напоминание о прогулке',
  emailBody: 'Ждём вас!',
  ticketTypes: [
    { name: 'Стандартный', priceKopecks: 50000, capacity: 10 },
  ],
}

describe('updateWalkFull — permissions', () => {
  it('throws "Недостаточно прав" when unauthenticated', async () => {
    authMock.mockResolvedValue(null)
    await expect(updateWalkFull('walk-1', FULL_PAYLOAD)).rejects.toThrow('Недостаточно прав')
  })
})

describe('updateWalkFull — email fields', () => {
  beforeEach(() => {
    walkMock.update.mockResolvedValue({ id: 'walk-1' })
    ticketTypeMock.deleteMany.mockResolvedValue({})
    ticketTypeMock.createMany.mockResolvedValue({})
  })

  it('persists emailSubject and emailBody when provided', async () => {
    await updateWalkFull('walk-1', FULL_PAYLOAD)
    expect(walkMock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailSubject: 'Напоминание о прогулке',
          emailBody: 'Ждём вас!',
        }),
      })
    )
  })

  it('stores null when email fields are omitted', async () => {
    const { emailSubject: _s, emailBody: _b, ...payloadWithout } = FULL_PAYLOAD
    await updateWalkFull('walk-1', payloadWithout)
    expect(walkMock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ emailSubject: null, emailBody: null }),
      })
    )
  })
})

describe('updateWalkFull — guide relation', () => {
  beforeEach(() => {
    walkMock.update.mockResolvedValue({ id: 'walk-1' })
    ticketTypeMock.deleteMany.mockResolvedValue({})
    ticketTypeMock.createMany.mockResolvedValue({})
  })

  it('uses guide: { connect } instead of raw guideId', async () => {
    await updateWalkFull('walk-1', FULL_PAYLOAD)
    expect(walkMock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ guide: { connect: { id: 1 } } }),
      })
    )
    // Raw guideId must not appear directly in the payload
    const call = walkMock.update.mock.calls[0][0]
    expect(call.data).not.toHaveProperty('guideId')
  })

})

describe('updateWalkFull — ticket types', () => {
  beforeEach(() => {
    walkMock.update.mockResolvedValue({ id: 'walk-1' })
    ticketTypeMock.deleteMany.mockResolvedValue({})
    ticketTypeMock.createMany.mockResolvedValue({})
  })

  it('deletes existing ticket types then creates new ones in a transaction', async () => {
    await updateWalkFull('walk-1', FULL_PAYLOAD)
    expect(ticketTypeMock.deleteMany).toHaveBeenCalledWith({ where: { walkId: 'walk-1' } })
    expect(ticketTypeMock.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ walkId: 'walk-1', name: 'Стандартный', priceKopecks: 50000, capacity: 10 }),
        ]),
      })
    )
  })

  it('calculates total capacity as sum of all ticket types', async () => {
    const payload = {
      ...FULL_PAYLOAD,
      ticketTypes: [
        { name: 'Взрослый', priceKopecks: 50000, capacity: 8 },
        { name: 'Детский', priceKopecks: 25000, capacity: 4 },
      ],
    }
    await updateWalkFull('walk-1', payload)
    expect(walkMock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ capacity: 12 }),
      })
    )
  })

  it('uses first ticket type price as priceKopecks on the walk', async () => {
    await updateWalkFull('walk-1', FULL_PAYLOAD)
    expect(walkMock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priceKopecks: 50000 }),
      })
    )
  })
})
