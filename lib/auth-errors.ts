export const AUTH_ERRORS = {
  network:        'Нет соединения с сервером. Проверьте интернет и попробуйте ещё раз.',
  generic:        'Не удалось выполнить действие. Попробуйте ещё раз.',

  wrongCredentials: 'Неверный email или пароль.',
  accountBlocked: 'Доступ к аккаунту ограничен. Напишите на birdwatching@mail.ru.',
  invalidCode:      'Неверный код. Проверьте его и попробуйте ещё раз.',
  expiredCode:      'Срок действия кода истёк. Отправьте новый код.',
  invalidChallenge: 'Сессия истекла. Начните вход заново.',
  passwordResetRequired: 'Пароль устарел. Запросите сброс пароля.',

  emailRequired:    'Введите почту, чтобы продолжить',
  emailInvalid:     'Введите почту в формате name@example.ru',
  nameRequired:     'Введите имя, чтобы продолжить',
  passwordRequired: 'Введите пароль, чтобы продолжить',
  resetLinkInvalid: 'Ссылка для сброса пароля недействительна или уже использована. Запросите новую.',
} as const;
