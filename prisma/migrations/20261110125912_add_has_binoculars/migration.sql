-- AlterTable
ALTER TABLE "Expedition" ALTER COLUMN "galleryUrls" DROP DEFAULT,
ALTER COLUMN "endsAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "hasBinoculars" BOOLEAN;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "hasBinoculars" BOOLEAN;

-- AlterTable
ALTER TABLE "Walk" ADD COLUMN     "purchaseEmailBody" TEXT,
ADD COLUMN     "purchaseEmailSubject" VARCHAR(255),
ADD COLUMN     "reminderDaysBefore" INTEGER,
ALTER COLUMN "endsAt" SET DATA TYPE TIMESTAMP(3);
