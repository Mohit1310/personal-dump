-- CreateEnum
CREATE TYPE "DumpType" AS ENUM ('note', 'error', 'solution');

-- AlterTable
ALTER TABLE "Dump"
ADD COLUMN "title" TEXT NOT NULL DEFAULT '',
ADD COLUMN "type" "DumpType" NOT NULL DEFAULT 'note',
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "source" TEXT NOT NULL DEFAULT '',
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Backfill existing dumps with their original creation time.
UPDATE "Dump"
SET "updatedAt" = "createdAt";

ALTER TABLE "Dump"
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
