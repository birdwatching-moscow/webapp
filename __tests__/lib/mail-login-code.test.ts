import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { sesClientSendSpy } = vi.hoisted(() => ({
  sesClientSendSpy: vi.fn(),
}))

vi.mock('@aws-sdk/client-sesv2', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SESv2Client: function (this: any) { this.send = sesClientSendSpy },
  SendEmailCommand: function (input: unknown) { return input },
}))

import { sendMail } from '@/lib/mail'

type SesInput = {
  Content: {
    Simple: {
      Subject: { Data: string }
      Body: { Html: { Data: string }; Text: { Data: string } }
    }
  }
}

beforeEach(() => {
  process.env.POSTBOX_KEY_ID = 'test-key-id'
  process.env.POSTBOX_KEY_SECRET = 'test-key-secret'
  sesClientSendSpy.mockReset()
  sesClientSendSpy.mockResolvedValue({})
})

afterEach(() => {
  delete process.env.POSTBOX_KEY_ID
  delete process.env.POSTBOX_KEY_SECRET
})

describe('sendMail — login-code', () => {
  it('calls sesClient.send with subject "Ваш код входа"', async () => {
    await sendMail({ to: 'user@example.com', kind: 'login-code', data: { code: 'ABCD2F' } })
    expect(sesClientSendSpy).toHaveBeenCalledTimes(1)
    const input = sesClientSendSpy.mock.calls[0][0] as SesInput
    expect(input.Content.Simple.Subject.Data).toBe('Ваш код входа')
  })

  it('html contains the code verbatim', async () => {
    await sendMail({ to: 'user@example.com', kind: 'login-code', data: { code: 'ABCD2F' } })
    const input = sesClientSendSpy.mock.calls[0][0] as SesInput
    expect(input.Content.Simple.Body.Html.Data).toContain('ABCD2F')
  })

  it('text contains the code verbatim', async () => {
    await sendMail({ to: 'user@example.com', kind: 'login-code', data: { code: 'ABCD2F' } })
    const input = sesClientSendSpy.mock.calls[0][0] as SesInput
    expect(input.Content.Simple.Body.Text.Data).toContain('ABCD2F')
  })

  it('html and text mention the 5-minute expiry', async () => {
    await sendMail({ to: 'user@example.com', kind: 'login-code', data: { code: 'ABCD2F' } })
    const input = sesClientSendSpy.mock.calls[0][0] as SesInput
    expect(input.Content.Simple.Body.Html.Data).toContain('5')
    expect(input.Content.Simple.Body.Text.Data).toContain('5')
  })
})
