-- CreateTable: BirdId singleton
CREATE TABLE "BirdId" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL DEFAULT '',
    "formUrl" VARCHAR(2048),
    "startsAt" TIMESTAMPTZ,
    "endsAt" TIMESTAMPTZ,
    "schedule" TEXT,
    "seminars" TEXT,
    "registrationDeadline" TIMESTAMPTZ,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "updatedBy" VARCHAR(254),

    CONSTRAINT "BirdId_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BirdIdTicketType
CREATE TABLE "BirdIdTicketType" (
    "id" SERIAL NOT NULL,
    "birdIdId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "priceKopecks" INTEGER,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BirdIdTicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BirdId-TeamMember M2M join table
-- "BirdId" < "TeamMember" alphabetically → A = BirdId.id (TEXT), B = TeamMember.id (INTEGER)
CREATE TABLE "_BirdIdTeam" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BirdIdTeam_AB_pkey" PRIMARY KEY ("A", "B")
);

-- Indexes
CREATE INDEX "BirdIdTicketType_birdIdId_idx" ON "BirdIdTicketType"("birdIdId");
CREATE INDEX "_BirdIdTeam_B_index" ON "_BirdIdTeam"("B");

-- FK constraints
ALTER TABLE "BirdIdTicketType" ADD CONSTRAINT "BirdIdTicketType_birdIdId_fkey"
    FOREIGN KEY ("birdIdId") REFERENCES "BirdId"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "_BirdIdTeam" ADD CONSTRAINT "_BirdIdTeam_A_fkey"
    FOREIGN KEY ("A") REFERENCES "BirdId"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_BirdIdTeam" ADD CONSTRAINT "_BirdIdTeam_B_fkey"
    FOREIGN KEY ("B") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
