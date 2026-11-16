import type { MetadataRoute } from 'next'

const PROD_URL = 'https://birdwatching.moscow'

const isProduction = process.env.APP_URL === PROD_URL

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/checkout/',
          '/payments/',
          '/certificates/',
          '/orders/',
          '/profile/',
          '/dev/',
        ],
      },
    ],
    sitemap: `${PROD_URL}/sitemap.xml`,
  }
}
