export const CONTACT_FORM_LABELS = {
  rateLimitTitle: 'Нужно немного передохнуть',
  rateLimitText: (minutes: string) =>
    `Вы исчерпали лимит обращений на данный момент. Мы сможем принять ваш следующий запрос через ${minutes}.`,
  submittedTitle: 'Заявка отправлена',
  serverError: 'Не удалось отправить заявку. Попробуйте ещё раз.',
  messageRequired: 'Напишите сообщение, чтобы продолжить',
  consentRequired: 'Дайте согласие на обработку данных, чтобы продолжить',
  fallbackNote: 'Если мы не связались — напишите нам на birdwatching@mail.ru',
  fallbackEmail: 'birdwatching@mail.ru',
} as const
