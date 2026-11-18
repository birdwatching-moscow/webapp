import { describe, it, expect } from 'vitest'
import { isRussianTimeZone } from '@/utils/timeZone'

describe('isRussianTimeZone', () => {
  it.each([
    'Europe/Moscow',
    'Europe/Kaliningrad',
    'Europe/Samara',
    'Asia/Yekaterinburg',
    'Asia/Novosibirsk',
    'Asia/Vladivostok',
    'Asia/Kamchatka',
  ])('%s → true', (tz) => {
    expect(isRussianTimeZone(tz)).toBe(true)
  })

  it.each(['Europe/Berlin', 'Europe/Minsk', 'Europe/Kyiv', 'Asia/Almaty', 'America/New_York', 'UTC', ''])(
    '%s → false',
    (tz) => {
      expect(isRussianTimeZone(tz)).toBe(false)
    },
  )
})
