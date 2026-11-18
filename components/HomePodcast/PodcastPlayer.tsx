'use client'

import { useSyncExternalStore } from 'react'
import { isRussianTimeZone } from '@/utils/timeZone'

const YANDEX_WIDGET_SRC = 'https://music.yandex.ru/iframe/#album/17448287'
// Trailer episode, embed code from Apple Podcasts
const APPLE_WIDGET_SRC =
  'https://embed.podcasts.apple.com/ua/podcast/%D0%B2%D0%B8%D1%82%D1%8E-%D0%B2%D0%B8%D0%B4%D0%B5%D0%BB-%D1%82%D1%80%D0%B5%D0%B9%D0%BB%D0%B5%D1%80-%D0%BF%D0%BE%D0%B4%D0%BA%D0%B0%D1%81%D1%82%D0%B0-%D0%BF%D1%80%D0%BE-%D0%BF%D1%82%D0%B8%D1%86/id1580414020?i=1000531511652'
const APPLE_SANDBOX =
  'allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation'
const APPLE_ALLOW = 'autoplay *; encrypted-media *; fullscreen *; clipboard-write'

type PodcastPlayerProps = {
  /** Applied to whichever iframe is shown */
  className?: string
  appleClassName?: string
}

const readTimeZone = (): string | null => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return null
  }
}

// The time zone never changes during a visit — nothing to subscribe to
const subscribe = () => () => {}
// Server and first client render: unknown → Yandex Music (most visitors are in Russia)
const serverTimeZone = (): string | null => null

/**
 * Yandex Music is unavailable outside Russia, so visitors elsewhere get the Apple
 * Podcasts player. The country is guessed from the browser time zone: no external
 * services, and the page stays static.
 */
export const PodcastPlayer = ({ className, appleClassName }: PodcastPlayerProps) => {
  const timeZone = useSyncExternalStore(subscribe, readTimeZone, serverTimeZone)
  const showApple = timeZone !== null && !isRussianTimeZone(timeZone)

  if (showApple) {
    return (
      <iframe
        src={APPLE_WIDGET_SRC}
        loading="lazy"
        allow={APPLE_ALLOW}
        sandbox={APPLE_SANDBOX}
        title="Подкаст «Витю видел?» в Apple Podcasts"
        className={[className, appleClassName].filter(Boolean).join(' ')}
      />
    )
  }

  return (
    <iframe
      src={YANDEX_WIDGET_SRC}
      // The player is a whole Yandex Music app (~300 requests, several MB) —
      // load it only when the user scrolls near this section.
      loading="lazy"
      title="Подкаст «Витю видел?» на Яндекс.Музыке"
      className={className}
    />
  )
}
