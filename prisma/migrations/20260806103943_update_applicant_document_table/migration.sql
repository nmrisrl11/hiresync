/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `ApplicantDocument` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `ApplicantDocument` table. All the data in the column will be lost.
  - Added the required column `fileKey` to the `ApplicantDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicantDocument" DROP COLUMN "fileUrl",
DROP COLUMN "publicId",
ADD COLUMN     "fileKey" TEXT NOT NULL;
