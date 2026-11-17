export type ProfileLinkPlatform = 'ebird' | 'rubirds'

export const PROFILE_LINK_PLATFORMS: { value: ProfileLinkPlatform; label: string; placeholder: string }[] = [
  { value: 'ebird',   label: 'eBird',    placeholder: 'https://ebird.org/profile/...' },
  { value: 'rubirds', label: 'RU-BIRDS', placeholder: 'https://ru-birds.ru/users/...' },
]

export function detectProfileLinkPlatform(url: string): ProfileLinkPlatform {
  if (url.includes('ru-birds.ru')) return 'rubirds'
  return 'ebird'
}

export function getProfileLinkLabel(href: string): string {
  const platform = detectProfileLinkPlatform(href)
  return PROFILE_LINK_PLATFORMS.find((p) => p.value === platform)!.label
}
