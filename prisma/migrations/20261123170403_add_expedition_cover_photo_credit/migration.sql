-- AlterTable
ALTER TABLE "Expedition" ADD COLUMN     "coverPhotoCredit" VARCHAR(500),
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Walk" ALTER COLUMN "updatedAt" DROP DEFAULT;
