export const ALLOWED_IMAGE_HOSTNAME = 'storage.yandexcloud.net'

export function validPhotoUrl(url: string): string | undefined {
  return url.startsWith(`https://${ALLOWED_IMAGE_HOSTNAME}`) ? url : undefined
}
