const UNKNOWN_IP = 'unknown'

/**
 * Client IP for rate limiting. Behind nginx (DEPLOY.md) X-Real-IP is $remote_addr.
 * X-Forwarded-For is `<whatever the client sent>, $remote_addr`: its leftmost entries
 * are client-controlled and can be forged per request, so only the last one is trusted.
 */
export const getClientIp = (req: Request): string => {
  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  const forwarded = req.headers
    .get('x-forwarded-for')
    ?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  return forwarded?.at(-1) ?? UNKNOWN_IP
}
