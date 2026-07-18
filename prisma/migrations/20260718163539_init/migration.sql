-- CreateEnum
CREATE TYPE "Section" AS ENUM ('READING', 'LISTENING', 'WRITING', 'SPEAKING');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'TRUE_FALSE_NG', 'FILL_BLANK', 'MATCHING');

-- CreateEnum
CREATE TYPE "WritingTaskType" AS ENUM ('TASK1', 'TASK2');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "section" "Section" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bodyText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL,
    "promptText" TEXT NOT NULL,
    "options" TEXT,
    "correctAnswer" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "taskType" "WritingTaskType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "minWords" INTEGER NOT NULL DEFAULT 150,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "part" INTEGER NOT NULL,
    "promptText" TEXT NOT NULL,
    "followUps" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "section" "Section" NOT NULL,
    "refId" TEXT NOT NULL,
    "refTitle" TEXT NOT NULL,
    "answers" TEXT,
    "rawScore" INTEGER,
    "totalScore" INTEGER,
    "bandScore" DOUBLE PRECISION NOT NULL,
    "aiCriteria" TEXT,
    "aiFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Attempt_userId_idx" ON "Attempt"("userId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
