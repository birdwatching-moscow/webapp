export const ROUTES = {
  // Public
  home:          '/',
  walks:         '/walks',
  walk:          (slug: string) => `/walks/${slug}` as const,
  expeditions:   '/expeditions',
  expedition:    (slug: string) => `/expeditions/${slug}` as const,
  privateEvents: '/private-events',
  privateWalks:         '/private-walks',
  privateLectures:      '/private-lectures',
  privateConsultations: '/private-consultations',
  media:         '/media',
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
