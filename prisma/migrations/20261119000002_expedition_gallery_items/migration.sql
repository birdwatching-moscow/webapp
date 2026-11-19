ALTER TABLE "Expedition" DROP COLUMN "galleryUrls";
ALTER TABLE "Expedition" ADD COLUMN "galleryItems" JSONB NOT NULL DEFAULT '[]';
