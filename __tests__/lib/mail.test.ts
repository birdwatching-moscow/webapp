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
  FromEmailAddress: string
  Destination: { ToAddresses: string[] }
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

describe('sendMail — welcome', () => {
  it('calls sesClient.send with correct to, subject, and html containing name', async () => {
    await sendMail({
      to: 'newuser@example.com',
      kind: 'welcome',
      data: { name: 'Иван' },
    })

    expect(sesClientSendSpy).toHaveBeenCalledTimes(1)
    const input = sesClientSendSpy.mock.calls[0][0] as SesInput
    expect(input.Destination.ToAddresses[0]).toBe('newuser@example.com')
    expect(input.Content.Simple.Subject.Data).toBe('Добро пожаловать в Birdwatching Moscow!')
    expect(input.Content.Simple.Body.Html.Data).toContain('Иван')
  })
})

describe('sendMail — password-reset', () => {
  it('calls sesClient.send with subject "Сброс пароля" and html containing link', async () => {
    await sendMail({
      to: 'user@example.com',
      kind: 'password-reset',
      data: { link: 'https://birdwatching-moscow.ru/reset-password/abc123' },
    })

    expect(sesClientSendSpy).toHaveBeenCalledTimes(1)
    const input = sesClientSendSpy.mock.calls[0][0] as SesInput
    expect(input.Content.Simple.Subject.Data).toBe('Сброс пароля')
    expect(input.Content.Simple.Body.Html.Data).toContain('https://birdwatching-moscow.ru/reset-password/abc123')
  })
})

describe('sendMail — order-paid', () => {
  it('calls sesClient.send with subject "Заказ оплачен — ваши билеты готовы" and html containing orderId', async () => {
    await sendMail({
      to: 'buyer@example.com',
      kind: 'order-paid',
      data: { orderId: 'order-12345' },
    })

    expect(sesClientSendSpy).toHaveBeenCalledTimes(1)
    const input = sesClientSendSpy.mock.calls[0][0] as SesInput
    expect(input.Content.Simple.Subject.Data).toBe('Заказ оплачен — ваши билеты готовы')
    expect(input.Content.Simple.Body.Html.Data).toContain('order-12345')
  })
})

describe('sendMail — missing config guard', () => {
  it('returns without calling sesClient.send when POSTBOX_KEY_ID is undefined', async () => {
    delete process.env.POSTBOX_KEY_ID

    await expect(
      sendMail({ to: 'user@example.com', kind: 'welcome', data: { name: 'Аня' } })
    ).resolves.toBeUndefined()

    expect(sesClientSendSpy).not.toHaveBeenCalled()
  })
})

describe('sendMail — transport failure', () => {
  it('does not rethrow when sesClient.send rejects', async () => {
    sesClientSendSpy.mockRejectedValueOnce(new Error('Connection timeout'))

    await expect(
      sendMail({ to: 'user@example.com', kind: 'welcome', data: { name: 'Аня' } })
    ).resolves.toBeUndefined()
  })
})
