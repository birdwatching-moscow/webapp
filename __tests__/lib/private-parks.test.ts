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

  it('photo credits name the author and license', () => {
    const captions = Object.fromEntries(
      PRIVATE_PARKS.map((p) => [p.name, p.photoCredit && `${p.photoCredit.author}, ${p.photoCredit.license}`]),
    )
    expect(captions).toEqual({
      'Скверы МГУ': 'Ivtorov, CC BY-SA 4.0',
      'Измайловский парк': 'Kristy2906, CC BY-SA 4.0',
      'Главный Ботанический сад': 'Andrey Korzun, CC BY-SA 4.0',
      'Парк Царицыно': 'Юрий Артамонов, CC BY 4.0',
      'Верхнеяузские болота (Лосиный остров)': 'Nikiforovvb, CC BY-SA 4.0',
      'Серебряный бор': 'Семашко Сергей Игоревич, CC BY-SA 4.0',
      'Парк Покровское-Стрешнево': 'Sunny365days, CC BY 4.0',
      'Парк Кузьминки': 'Oleg Yu.Novikov, CC BY 3.0',
      'Коломенское': 'Alexander Baranov, CC BY 2.0',
      'Виноградовская пойма': 'Powakkattsi, CC BY-SA 4.0',
      'Лотошинский рыбхоз': 'Дмитрий Мозжухин, CC BY 3.0',
      'Битцевский лес': undefined,
      'Нескучный сад': 'Valeri Pizhanski, CC BY-SA 2.0',
      'Щукинский полуостров': 'MBH, CC BY 4.0',
      'Яхромская пойма': 'Mike like0708, CC BY-SA 4.0',
      'Лианозовский питомник': 'Gennady Grachev, CC BY 2.0',
      'Константиново (Сергиево-Посадского района)': undefined,
      'Хотьково (велобёрдинг)': undefined,
    })
  })

  it('author links to the Wikimedia Commons file page', () => {
    for (const { name, photoCredit } of PRIVATE_PARKS) {
      if (photoCredit) expect(photoCredit.sourceUrl, name).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:.+\.jpg$/i)
    }
    expect(PRIVATE_PARKS[0].photoCredit?.sourceUrl).toBe('https://commons.wikimedia.org/wiki/File:2016-MSU.jpg')
  })

  it('license links to the text of that exact license', () => {
    for (const { name, photoCredit } of PRIVATE_PARKS) {
      if (!photoCredit) continue
      const [, kind, version] = photoCredit.license.match(/^CC (BY(?:-SA)?) (\d\.\d)$/) ?? []
      expect(kind, name).toBeDefined()
      expect(photoCredit.licenseUrl, name).toBe(`https://creativecommons.org/licenses/${kind.toLowerCase()}/${version}/`)
    }
  })
})
