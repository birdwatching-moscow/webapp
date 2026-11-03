import { config } from "dotenv"
import { definePrismaConfig } from "prisma/config"

// Load .env.production so DATABASE_URL is available to all prisma CLI commands
config({ path: ".env.production" })

export default definePrismaConfig({
  orm: {
    schema: "prisma/schema.prisma",
    migrations: {
      path: "prisma/migrations",
      seed: "tsx --env-file=.env.production prisma/seed.ts",
    },
    datasource: {
      url: process.env.DATABASE_URL,
    },
  },
})