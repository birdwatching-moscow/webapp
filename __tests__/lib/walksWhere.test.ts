import { describe, it, expect } from 'vitest'
import { buildWalksWhere } from '@/lib/admin/walksWhere'

const NOW = new Date('2026-06-15T12:00:00Z')

describe('buildWalksWhere — no filters', () => {
  it('excludes DELETED walks when no statuses are given', () => {
    const result = buildWalksWhere({ now: NOW })
    expect(result).toEqual({ status: { not: 'DELETED' } })
  })

  it('returns a single condition directly, not wrapped in AND', () => {
    const result = buildWalksWhere({ now: NOW })
    expect(result).not.toHaveProperty('AND')
  })
})

describe('buildWalksWhere — text search', () => {
  it('adds case-insensitive title search when q is provided', () => {
    const result = buildWalksWhere({ q: 'сова', now: NOW })
    expect(result).toMatchObject({
      AND: expect.arrayContaining([
        { title: { contains: 'сова', mode: 'insensitive' } },
      ]),
    })
  })

  it('ignores empty q', () => {
    const result = buildWalksWhere({ q: '', now: NOW })
    expect(result).toEqual({ status: { not: 'DELETED' } })
  })
})

describe('buildWalksWhere — date range', () => {
  it('adds gte filter for fromStr', () => {
    const result = buildWalksWhere({ fromStr: '2026-06-01', now: NOW })
    expect(result).toMatchObject({
      AND: expect.arrayContaining([
        { startsAt: { gte: new Date('2026-06-01') } },
      ]),
    })
  })

  it('adds lte filter for toStr with end-of-day time', () => {
    const result = buildWalksWhere({ toStr: '2026-06-30', now: NOW })
    expect(result).toMatchObject({
      AND: expect.arrayContaining([
        { startsAt: { lte: new Date('2026-06-30T23:59:59') } },
      ]),
    })
  })

  it('ignores empty fromStr and toStr', () => {
    const result = buildWalksWhere({ fromStr: '', toStr: '', now: NOW })
    expect(result).toEqual({ status: { not: 'DELETED' } })
  })
})

describe('buildWalksWhere — status filter', () => {
  // When only statuses are given, 'and' has a single entry so the function
  // returns it directly (not wrapped in { AND: [...] }).

  it('"active" maps to ACTIVE walks starting in the future', () => {
    const result = buildWalksWhere({ statuses: ['active'], now: NOW })
    expect(result).toMatchObject({
      OR: expect.arrayContaining([
        { status: 'ACTIVE', startsAt: { gte: NOW } },
      ]),
    })
  })

  it('"past" maps to ACTIVE walks starting before now', () => {
    const result = buildWalksWhere({ statuses: ['past'], now: NOW })
    expect(result).toMatchObject({
      OR: expect.arrayContaining([
        { status: 'ACTIVE', startsAt: { lt: NOW } },
      ]),
    })
  })

  it('"draft" maps to status DRAFT', () => {
    const result = buildWalksWhere({ statuses: ['draft'], now: NOW })
    expect(result).toMatchObject({ OR: expect.arrayContaining([{ status: 'DRAFT' }]) })
  })

  it('"cancelled" maps to status CANCELLED', () => {
    const result = buildWalksWhere({ statuses: ['cancelled'], now: NOW })
    expect(result).toMatchObject({ OR: expect.arrayContaining([{ status: 'CANCELLED' }]) })
  })

  it('combines multiple statuses in one OR', () => {
    const result = buildWalksWhere({ statuses: ['draft', 'cancelled'], now: NOW })
    // Single OR condition returned directly (no AND wrapper)
    expect(result).toHaveProperty('OR')
    expect((result as { OR: unknown[] }).OR).toHaveLength(2)
  })

  it('does not add DELETED exclusion when statuses are explicitly given', () => {
    const result = buildWalksWhere({ statuses: ['draft'], now: NOW })
    expect(JSON.stringify(result)).not.toContain('DELETED')
  })
})

describe('buildWalksWhere — guide filter', () => {
  it('filters by guideId when guides are given', () => {
    const result = buildWalksWhere({ guides: ['3', '7'], now: NOW })
    expect(result).toMatchObject({
      AND: expect.arrayContaining([
        { guideId: { in: [3, 7] } },
      ]),
    })
  })

  it('ignores empty guides array', () => {
    const result = buildWalksWhere({ guides: [], now: NOW })
    expect(result).toEqual({ status: { not: 'DELETED' } })
  })
})

describe('buildWalksWhere — combined filters', () => {
  it('wraps in AND when multiple conditions are present', () => {
    const result = buildWalksWhere({ q: 'утка', fromStr: '2026-01-01', now: NOW })
    expect(result).toHaveProperty('AND')
    expect((result as { AND: unknown[] }).AND).toHaveLength(3) // q + from + status exclusion
  })

  it('returns a single condition directly when only one is present', () => {
    const result = buildWalksWhere({ now: NOW }) // only the DELETED exclusion
    expect(result).not.toHaveProperty('AND')
    expect(result).toEqual({ status: { not: 'DELETED' } })
  })
})
