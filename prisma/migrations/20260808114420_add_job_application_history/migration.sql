-- CreateEnum
CREATE TYPE "ApplicationEventType" AS ENUM ('SUBMITTED', 'STATUS_UPDATED', 'NOTE_ADDED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "JobApplicationHistory" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "eventType" "ApplicationEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplicationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobApplicationHistory_jobApplicationId_idx" ON "JobApplicationHistory"("jobApplicationId");

-- AddForeignKey
ALTER TABLE "JobApplicationHistory" ADD CONSTRAINT "JobApplicationHistory_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
