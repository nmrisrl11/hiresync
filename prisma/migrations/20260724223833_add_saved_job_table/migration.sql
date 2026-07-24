-- CreateTable
CREATE TABLE "SavedJob" (
    "applicantId" TEXT NOT NULL,
    "jobListingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("applicantId","jobListingId")
);

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
