-- Expedition.endsAt: optional end date for multi-day expeditions
ALTER TABLE "Expedition" ADD COLUMN "endsAt" TIMESTAMPTZ;
