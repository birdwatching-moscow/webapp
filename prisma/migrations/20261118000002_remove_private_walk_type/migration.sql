-- Migrate existing PRIVATE_WALK rows to PRIVATE_EVENT before removing the value
UPDATE "Request" SET "type" = 'PRIVATE_EVENT' WHERE "type" = 'PRIVATE_WALK';

-- Remove PRIVATE_WALK from the enum (PostgreSQL requires recreating the type)
ALTER TYPE "RequestType" RENAME TO "RequestType_old";
CREATE TYPE "RequestType" AS ENUM ('EXPEDITION', 'CERTIFICATE', 'QUESTION', 'PRIVATE_EVENT');
ALTER TABLE "Request" ALTER COLUMN "type" TYPE "RequestType" USING "type"::text::"RequestType";
DROP TYPE "RequestType_old";
