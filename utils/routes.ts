export const ROUTES = {
  // Public
  home:          '/',
  walks:         '/walks',
  expeditions:   '/expeditions',
  privateEvents: '/private-events',
  book:          '/book',
  about:         '/about',
  faq:           '/faq',
  certificates:  '/certificates',
  birdid:        '/birdid',
  oferta:        '/oferta',

  // Auth
  login:         '/login',
  register:      '/register',
  resetPassword: '/reset-password',
  profile:       '/profile',

  // Admin
  admin: {
    walks:          '/admin/walks',
    walksNew:       '/admin/walks/new',
    expeditions:    '/admin/expeditions',
    expeditionsNew: '/admin/expeditions/new',
    team:           '/admin/team',
    teamNew:        '/admin/team/new',
    requests:       '/admin/requests',
    users:          '/admin/users',
  },
} as const
