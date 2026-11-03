import { readdirSync } from 'fs'
import path from 'path'

const BIRDS_DIR = path.join(process.cwd(), 'public', 'footer-birds')
const SUPPORTED = /\.(jpg|jpeg|png|webp|avif)$/i

export function getRandomBirdSrc(): string | null {
  try {
    const files = readdirSync(BIRDS_DIR).filter(f => SUPPORTED.test(f))
    if (files.length === 0) return null
    return `/footer-birds/${files[Math.floor(Math.random() * files.length)]}`
  } catch {
    return null
  }
}
