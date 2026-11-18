import { describe, it, expect } from 'vitest'
import { getClientIp } from '@/lib/clientIp'

const req = (headers: Record<string, string>) => new Request('http://localhost/api', { headers })

// Behind nginx (DEPLOY.md): X-Real-IP = $remote_addr, X-Forwarded-For = <whatever the client sent>, $remote_addr
describe('getClientIp', () => {
  it('uses X-Real-IP set by nginx', () => {
    expect(getClientIp(req({ 'x-real-ip': '5.5.5.5' }))).toBe('5.5.5.5')
  })

  it('ignores a forged X-Forwarded-For when X-Real-IP is present', () => {
    expect(getClientIp(req({ 'x-real-ip': '5.5.5.5', 'x-forwarded-for': '1.2.3.4, 5.5.5.5' }))).toBe('5.5.5.5')
  })

  it('without X-Real-IP takes the last X-Forwarded-For entry (the one the proxy appended)', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '1.2.3.4, 6.6.6.6' }))).toBe('6.6.6.6')
  })

  it('trims whitespace', () => {
    expect(getClientIp(req({ 'x-real-ip': '  5.5.5.5 ' }))).toBe('5.5.5.5')
    expect(getClientIp(req({ 'x-forwarded-for': '1.2.3.4 ,  6.6.6.6  ' }))).toBe('6.6.6.6')
  })

  it("falls back to 'unknown' without proxy headers", () => {
    expect(getClientIp(req({}))).toBe('unknown')
    expect(getClientIp(req({ 'x-real-ip': ' ', 'x-forwarded-for': ' , ' }))).toBe('unknown')
  })
})
