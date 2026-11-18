import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync } from 'fs'
import path from 'path'
import { PRIVATE_PARKS } from '@/lib/private/parks'

const PARKS_DIR = path.join(process.cwd(), 'public', 'images', 'parks')

describe('PRIVATE_PARKS data', () => {
  it('has 18 locations in design order', () => {
    expect(PRIVATE_PARKS).toHaveLength(18)
    expect(PRIVATE_PARKS[0].name).toBe('Скверы МГУ')
    expect(PRIVATE_PARKS.at(-1)?.name).toBe('Хотьково (велобёрдинг)')
  })

  it('names are unique', () => {
    const names = PRIVATE_PARKS.map((p) => p.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('species never repeat the «Птицы:» prefix (the card adds it)', () => {
    for (const park of PRIVATE_PARKS) expect(park.species).not.toMatch(/^Птицы:/)
  })

  it('every image path points to an existing file in public/images/parks', () => {
    for (const park of PRIVATE_PARKS) {
      if (!park.imageUrl) continue
      expect(park.imageUrl).toMatch(/^\/images\/parks\/[a-z_]+\.jpg$/)
      expect(existsSync(path.join(process.cwd(), 'public', park.imageUrl))).toBe(true)
    }
  })

  it('uses every photo from public/images/parks exactly once', () => {
    const used = PRIVATE_PARKS.flatMap((p) => (p.imageUrl ? [path.basename(p.imageUrl)] : []))
    expect(new Set(used).size).toBe(used.length)
    expect([...used].sort()).toEqual(readdirSync(PARKS_DIR).filter((f) => f.endsWith('.jpg')).sort())
  })

  it('every park has a photo', () => {
    for (const park of PRIVATE_PARKS) expect(park.imageUrl, park.name).toBeDefined()
  })
})
