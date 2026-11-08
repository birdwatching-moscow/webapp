import { config } from "dotenv"
import { definePrismaConfig } from "prisma/config"
import { defineConfig as ormConfig, prisma7Schema } from "@prisma/orm-postgres/config"

// Load .env.production so DATABASE_URL is available to all prisma CLI commands
config({ path: ".env.production" })

export default definePrismaConfig({
  orm: ormConfig({
    contract: prisma7Schema("prisma/schema.prisma"),
    db: {
      connection: process.env.DATABASE_URL!,
    },
  }),
})
