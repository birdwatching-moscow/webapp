import { readdirSync } from 'fs'
import path from 'path'

const BIRDS_DIR = path.join(process.cwd(), 'public', 'footer-birds')
const SUPPORTED = /\.(jpg|jpeg|png|webp|avif)$/i

export function nameFromFilename(filename: string): string {
  return filename
    .replace(SUPPORTED, '')
    .replace(/[-_]+/g, ' ')
    .replace(/^\p{L}/u, c => c.toUpperCase())
}

export type BirdPhoto = { src: string; name: string }

export function getRandomBirdSrc(): BirdPhoto | null {
  try {
    const files = readdirSync(BIRDS_DIR).filter(f => SUPPORTED.test(f))
    if (files.length === 0) return null
    const file = files[Math.floor(Math.random() * files.length)]
    return { src: `/footer-birds/${file}`, name: nameFromFilename(file) }
  } catch {
    return null
  }
}
