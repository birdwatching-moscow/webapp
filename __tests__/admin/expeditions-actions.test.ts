import { describe, it, expect, vi, beforeEach } from 'vitest'

const { authMock, expeditionMock, expeditionDayMock, requestMock, userMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  expeditionMock: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  expeditionDayMock: { deleteMany: vi.fn(), createMany: vi.fn() },
  requestMock: { count: vi.fn() },
  // publishExpedition checks the publishing admin still exists before recording publishedBy
  userMock: { count: vi.fn().mockResolvedValue(1) },
}))

vi.mock('@/lib/auth', () => ({ auth: authMock }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    expedition: expeditionMock,
    expeditionDay: expeditionDayMock,
    request: requestMock,
    user: userMock,
  },
}))

import {
  createExpedition,
  updateExpedition,
  publishExpedition,
  cancelExpedition,
  deleteExpedition,
} from '@/app/admin/expeditions/_actions'
import { EventStatus } from '@/generated/prisma/client'

const ADMIN_SESSION = { user: { id: 'u1', role: 'ADMIN' as const, name: 'Admin' } }
const FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

const VALID_EXPEDITION_INPUT = {
  type: 'EXPEDITION' as const,
  title: 'Test Expedition',
  description: 'Description',
  startsAt: FUTURE,
  coverPhotoUrl: 'https://example.com/photo.jpg',
  galleryItems: [
    { url: 'https://example.com/g1.jpg', info: 'Bird 1' },
    { url: 'https://example.com/g2.jpg', info: 'Bird 2' },
  ],
  checklistItems: [],
  totalSpots: 10,
  spotsLeft: 10,
  guideIds: ['1', '2'],
  days: [{ clientId: 'day-1', dayNumber: 1, title: 'Day 1', description: 'Desc' }],
}

beforeEach(() => {
  vi.clearAllMocks()
  authMock.mockResolvedValue(ADMIN_SESSION)
  expeditionMock.create.mockResolvedValue({ id: 'exp-1' })
  expeditionMock.findFirst.mockResolvedValue(null)
})

describe('createExpedition — gallery items', () => {
  it('accepts galleryItems with 3 or fewer items', async () => {
    const input = {
      ...VALID_EXPEDITION_INPUT,
      galleryItems: Array.from({ length: 3 }, (_, i) => ({ url: `https://example.com/g${i}.jpg`, info: '' })),
    }
    await expect(createExpedition(input)).resolves.not.toThrow()
  })

  it('rejects galleryItems array longer than 3 items', async () => {
    const input = {
      ...VALID_EXPEDITION_INPUT,
      galleryItems: Array.from({ length: 4 }, (_, i) => ({ url: `https://example.com/g${i}.jpg`, info: '' })),
    }
    await expect(createExpedition(input)).rejects.toThrow(/не более 3/)
  })
})

describe('updateExpedition — gallery items', () => {
  it('rejects galleryItems array longer than 3 items', async () => {
    const input = {
      ...VALID_EXPEDITION_INPUT,
      galleryItems: Array.from({ length: 4 }, (_, i) => ({ url: `https://example.com/g${i}.jpg`, info: '' })),
    }
    await expect(updateExpedition('exp-1', input)).rejects.toThrow(/не более 3/)
  })
})

const ACTIVE_EXPEDITION = {
  id: 'exp-1',
  status: EventStatus.ACTIVE,
  startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  publishedAt: null,
  publishedBy: null,
}

const DRAFT_EXPEDITION = { ...ACTIVE_EXPEDITION, status: EventStatus.DRAFT }
const CANCELLED_EXPEDITION = { ...ACTIVE_EXPEDITION, status: EventStatus.CANCELLED }
const PAST_EXPEDITION = { ...CANCELLED_EXPEDITION, startsAt: new Date(Date.now() - 60 * 60 * 1000) }

describe('publishExpedition', () => {
  it('throws when expedition is already ACTIVE', async () => {
    expeditionMock.findFirst.mockResolvedValue(ACTIVE_EXPEDITION)
    await expect(publishExpedition('exp-1')).rejects.toThrow('Экспедиция уже опубликована')
  })

  it('calls expedition.update with ACTIVE when status is DRAFT', async () => {
    expeditionMock.findFirst.mockResolvedValue(DRAFT_EXPEDITION)
    expeditionMock.update.mockResolvedValue({})
    await publishExpedition('exp-1')
    expect(expeditionMock.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: EventStatus.ACTIVE }) })
    )
  })
})

describe('cancelExpedition', () => {
  it('throws when expedition is not ACTIVE', async () => {
    expeditionMock.findFirst.mockResolvedValue(DRAFT_EXPEDITION)
    await expect(cancelExpedition('exp-1')).rejects.toThrow()
  })

  it('calls expedition.update with CANCELLED when expedition is ACTIVE', async () => {
    expeditionMock.findFirst.mockResolvedValue(ACTIVE_EXPEDITION)
    expeditionMock.update.mockResolvedValue({})
    await cancelExpedition('exp-1')
    expect(expeditionMock.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: EventStatus.CANCELLED }) })
    )
  })
})

describe('deleteExpedition', () => {
  it('throws when linked requests exist', async () => {
    requestMock.count.mockResolvedValue(1)
    await expect(deleteExpedition('exp-1')).rejects.toThrow('Нельзя удалить экспедицию с заявками.')
  })

  it('calls expedition.update with DELETED when no requests exist', async () => {
    requestMock.count.mockResolvedValue(0)
    expeditionMock.update.mockResolvedValue({})
    await deleteExpedition('exp-1')
    expect(expeditionMock.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'DELETED' }) })
    )
  })
})
