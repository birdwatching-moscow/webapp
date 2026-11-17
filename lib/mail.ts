import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import {
  POSTBOX_DEFAULT_FROM_ADDRESS,
  POSTBOX_DEFAULT_FROM_NAME,
} from '@/lib/constants'

export type MailKind = 'welcome' | 'password-reset' | 'order-paid' | 'login-code' | 'already-registered' | 'contact-request'

interface MailTemplate {
  subject: string
  html: string
  text: string
}

const sesClient = new SESv2Client({
  endpoint: 'https://postbox.cloud.yandex.net',
  region: 'ru-central1',
  credentials: {
    accessKeyId:     process.env.POSTBOX_KEY_ID     ?? '',
    secretAccessKey: process.env.POSTBOX_KEY_SECRET ?? '',
  },
})

function welcomeTemplate(data: Record<string, string>): MailTemplate {
  const name = data.name ?? ''
  return {
    subject: 'Добро пожаловать в Birdwatching Moscow!',
    html: `
      <div>
        <h1>Добро пожаловать, ${name}!</h1>
        <p>Спасибо, что зарегистрировались на «Birdwatching Moscow». Теперь вы можете
        записываться на орнитологические прогулки и экспедиции.</p>
      </div>
    `,
    text: `Добро пожаловать, ${name}!\n\nСпасибо, что зарегистрировались на «Birdwatching Moscow». Теперь вы можете записываться на орнитологические прогулки и экспедиции.`,
  }
}

function passwordResetTemplate(data: Record<string, string>): MailTemplate {
  const link = data.link ?? ''
  return {
    subject: 'Сброс пароля',
    html: `
      <div>
        <h1>Сброс пароля</h1>
        <p>Вы запросили сброс пароля. Перейдите по ссылке ниже, чтобы задать новый пароль:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Если вы не запрашивали сброс пароля, просто игнорируйте это письмо.</p>
      </div>
    `,
    text: `Вы запросили сброс пароля. Перейдите по ссылке, чтобы задать новый пароль: ${link}\n\nЕсли вы не запрашивали сброс пароля, просто игнорируйте это письмо.`,
  }
}

function orderPaidTemplate(data: Record<string, string>): MailTemplate {
  const orderId = data.orderId ?? ''
  return {
    subject: 'Заказ оплачен — ваши билеты готовы',
    html: `
      <div>
        <h1>Заказ оплачен</h1>
        <p>Ваш заказ ${orderId} успешно оплачен. Билеты уже доступны в личном кабинете и почте.</p>
      </div>
    `,
    text: `Ваш заказ ${orderId} успешно оплачен. Билеты уже доступны в личном кабинете и почте.`,
  }
}

function loginCodeTemplate(data: Record<string, string>): MailTemplate {
  const code = data.code ?? ''
  return {
    subject: 'Ваш код входа',
    html: `
      <div>
        <h1>Код для входа</h1>
        <p>Введите этот код на странице входа:</p>
        <p>${code}</p>
        <p>Код действует 5 минут.</p>
        <p>Если вы не запрашивали код, просто игнорируйте это письмо.</p>
      </div>
    `,
    text: `Код для входа: ${code}\n\nКод действует 5 минут.\n\nЕсли вы не запрашивали код, просто игнорируйте это письмо.`,
  }
}

function alreadyRegisteredTemplate(data: Record<string, string>): MailTemplate {
  const loginUrl = data.loginUrl ?? '/login'
  return {
    subject: 'Вы уже зарегистрированы на Birdwatching Moscow',
    html: `
      <div>
        <h1>Вы уже зарегистрированы</h1>
        <p>Кто-то попытался зарегистрироваться с вашим адресом электронной почты на сайте Birdwatching Moscow.</p>
        <p>Если это были вы — просто войдите в аккаунт по ссылке ниже:</p>
        <p><a href="${loginUrl}">${loginUrl}</a></p>
        <p>Если вы не делали этого запроса, проигнорируйте письмо.</p>
      </div>
    `,
    text: `Кто-то попытался зарегистрироваться с вашим адресом на сайте Birdwatching Moscow.\n\nЕсли это были вы — войдите по ссылке: ${loginUrl}\n\nЕсли нет — просто проигнорируйте это письмо.`,
  }
}

function contactRequestTemplate(data: Record<string, string>): MailTemplate {
  const { label, name, email, message } = data
  const subject = `${name} — ${label}`
  const text = `Имя: ${name}\nПочта: ${email}\nКомментарий: ${message}`
  return {
    subject,
    html: `<p><b>Имя:</b> ${name}</p><p><b>Почта:</b> ${email}</p><p><b>Комментарий:</b> ${message}</p>`,
    text,
  }
}

function buildTemplate(kind: MailKind, data: Record<string, string>): MailTemplate {
  switch (kind) {
    case 'welcome':
      return welcomeTemplate(data)
    case 'password-reset':
      return passwordResetTemplate(data)
    case 'order-paid':
      return orderPaidTemplate(data)
    case 'login-code':
      return loginCodeTemplate(data)
    case 'already-registered':
      return alreadyRegisteredTemplate(data)
    case 'contact-request':
      return contactRequestTemplate(data)
  }
}

export async function sendMail(args: {
  to: string
  kind: MailKind
  data: Record<string, string>
}): Promise<void> {
  if (!process.env.POSTBOX_KEY_ID) return

  const fromAddress = process.env.POSTBOX_FROM_ADDRESS || POSTBOX_DEFAULT_FROM_ADDRESS
  const fromName = process.env.POSTBOX_FROM_NAME || POSTBOX_DEFAULT_FROM_NAME
  const { subject, html, text } = buildTemplate(args.kind, args.data)

  try {
    await sesClient.send(new SendEmailCommand({
      FromEmailAddress: `"${fromName}" <${fromAddress}>`,
      Destination: { ToAddresses: [args.to] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: html, Charset: 'UTF-8' },
            Text: { Data: text, Charset: 'UTF-8' },
          },
        },
      },
    }))
  } catch (err) {
    console.error('[mail] send failed:', err)
  }
}
