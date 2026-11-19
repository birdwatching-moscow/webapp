ALTER TABLE "Expedition" ADD COLUMN "includedItems" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Expedition" ADD COLUMN "excludedItems" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE TABLE "ExpeditionTicketType" (
    "id"           SERIAL PRIMARY KEY,
    "expeditionId" TEXT NOT NULL,
    "name"         VARCHAR(100) NOT NULL,
    "priceKopecks" INTEGER,
    "capacity"     INTEGER NOT NULL DEFAULT 0,
    "sortOrder"    INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE "ExpeditionTicketType" ADD CONSTRAINT "ExpeditionTicketType_expeditionId_fkey"
  FOREIGN KEY ("expeditionId") REFERENCES "Expedition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "ExpeditionTicketType_expeditionId_idx" ON "ExpeditionTicketType"("expeditionId");
