-- Add subtitle and second guide to Walk
ALTER TABLE "Walk" ADD COLUMN "subtitle" VARCHAR(300);
ALTER TABLE "Walk" ADD COLUMN "guideId2" INTEGER;

-- Add foreign key for second guide
ALTER TABLE "Walk" ADD CONSTRAINT "Walk_guideId2_fkey"
  FOREIGN KEY ("guideId2") REFERENCES "TeamMember"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Create TicketType table
CREATE TABLE "TicketType" (
  "id"           SERIAL PRIMARY KEY,
  "walkId"       TEXT NOT NULL,
  "name"         VARCHAR(100) NOT NULL,
  "priceKopecks" INTEGER,
  "capacity"     INTEGER NOT NULL DEFAULT 0,
  "sortOrder"    INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_walkId_fkey"
  FOREIGN KEY ("walkId") REFERENCES "Walk"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "TicketType_walkId_idx" ON "TicketType"("walkId");
