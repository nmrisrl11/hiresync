-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "isMfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaBackupCodes" TEXT[],
ADD COLUMN     "mfaPendingSecret" TEXT,
ADD COLUMN     "mfaSecret" TEXT;
