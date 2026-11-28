export const CONTACT_EMAIL = 'info@birdwatching.moscow'

/**
 * Only admins have passwords, so the password-reset pages and API live under an
 * unguessable segment. It must match the folder names
 * app/(site)/(auth)/<segment>/ and app/api/auth/<segment>/ (enforced by
 * __tests__/app/auth/reset-path.test.ts). Never link it publicly or list it
 * in robots.ts / sitemap.ts — that would reveal it.
 */
const PASSWORD_RESET_SEGMENT = '8qfzgof9uev06a'

export const ROUTES = {
  // Public
  home:          '/',
  walks:         '/walks',
  walk:          (slug: string) => `/walks/${slug}` as const,
  expeditions:   '/expeditions',
  expedition:    (slug: string) => `/expeditions/${slug}` as const,
  private:       '/private',
  privateParks:         '/private-parks',
  privateLectures:      '/private-lectures',
  privateConsultations: '/private-consultations',
  media:         '/media',
  partners:      '/partners',
  book:          '/book',
  about:         '/about',
  faq:           '/faq',
  certificates:  '/certificates',
  birdid:        '/birdid',
  oferta:        '/oferta',

  // Auth
  login:         '/login',
  register:      '/register',
  resetPassword: `/${PASSWORD_RESET_SEGMENT}/reset-password`,
  profile:       '/profile',

  // Admin
  admin: {
    walks:          '/admin/walks',
    walksNew:       '/admin/walks/new',
    expeditions:    '/admin/expeditions',
    expeditionsNew: '/admin/expeditions/new',
    birdid:         '/admin/birdid',
    team:           '/admin/team',
    teamNew:        '/admin/team/new',
    requests:       '/admin/requests',
    users:          '/admin/users',
  },
} as const

export const API_ROUTES = {
  checkout:  '/api/checkout',
  requests:  '/api/requests',
  orders:    (id: string) => `/api/orders/${id}`,

  user: {
    updateName: '/api/user/update-name',
  },

  admin: {
    upload:         (folder: string) => `/api/admin/upload?folder=${folder}`,
    walksExport:    '/api/admin/walks/export',
    requestsExport: '/api/admin/requests/export',
  },

  auth: {
    checkEmail:              '/api/auth/check-email',
    requestLoginCode:        '/api/auth/request-login-code',
    register:                '/api/auth/register',
    verifyRegistrationCode:  '/api/auth/verify-registration-code',
    verifyLoginCode:         '/api/auth/verify-login-code',
    setInitialPassword:      '/api/auth/set-initial-password',
    requestPasswordReset:    `/api/auth/${PASSWORD_RESET_SEGMENT}/request-password-reset`,
    resetPassword:           `/api/auth/${PASSWORD_RESET_SEGMENT}/reset-password`,
  },

  payments: {
    yookassaWebhook: '/api/payments/yookassa/webhook',
  },
} as const
