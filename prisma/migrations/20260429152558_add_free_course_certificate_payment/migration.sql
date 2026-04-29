-- AlterEnum
ALTER TYPE "CertificateStatus" ADD VALUE 'PENDING_PAYMENT';

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "certificatePaidAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "certificateFee" DECIMAL(10,2),
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false;
