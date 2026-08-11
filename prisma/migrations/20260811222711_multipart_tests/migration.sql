-- Restructure Test -> TestPart -> Question so one Test is a full IELTS exam
-- (Reading: 3 passages, Listening: 4 sections) instead of a single passage.
-- Data-preserving: every existing Test becomes a one-part test.

-- 1. New TestPart table
CREATE TABLE "TestPart" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "part" INTEGER NOT NULL,
    "title" TEXT,
    "bodyText" TEXT NOT NULL,

    CONSTRAINT "TestPart_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TestPart_testId_part_key" ON "TestPart"("testId", "part");

ALTER TABLE "TestPart" ADD CONSTRAINT "TestPart_testId_fkey"
    FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Migrate each existing Test's passage into part 1
INSERT INTO "TestPart" ("id", "testId", "part", "title", "bodyText")
SELECT 'p1_' || "id", "id", 1, NULL, "bodyText" FROM "Test";

-- 3. Point questions at their part instead of the test
ALTER TABLE "Question" ADD COLUMN "partId" TEXT;

UPDATE "Question" q
SET "partId" = tp."id"
FROM "TestPart" tp
WHERE tp."testId" = q."testId" AND tp."part" = 1;

DELETE FROM "Question" WHERE "partId" IS NULL;

ALTER TABLE "Question" ALTER COLUMN "partId" SET NOT NULL;

ALTER TABLE "Question" DROP CONSTRAINT "Question_testId_fkey";
ALTER TABLE "Question" DROP COLUMN "testId";

ALTER TABLE "Question" ADD CONSTRAINT "Question_partId_fkey"
    FOREIGN KEY ("partId") REFERENCES "TestPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Passage text now lives on TestPart
ALTER TABLE "Test" DROP COLUMN "bodyText";

-- 5. Task 1 chart spec (JSON) for Writing
ALTER TABLE "WritingTask" ADD COLUMN "chartData" TEXT;
