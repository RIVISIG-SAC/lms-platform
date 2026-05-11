-- AlterEnum
ALTER TYPE "CertificateStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "certificateValidityDays" INTEGER;
