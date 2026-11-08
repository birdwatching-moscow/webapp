import { config } from "dotenv"
import { defineConfig } from "prisma/config"

// Load .env.production so DATABASE_URL is available to all prisma CLI commands
config({ path: ".env.production" })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
