-- Libro de Reclamaciones virtual (requisito de INDECOPI y de Culqi).

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ADMIN_NEW_COMPLAINT';

-- CreateEnum
CREATE TYPE "ComplaintType" AS ENUM ('RECLAMO', 'QUEJA');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'ANSWERED');

-- CreateEnum
CREATE TYPE "ComplaintDocumentType" AS ENUM ('DNI', 'CE', 'PASAPORTE', 'RUC');

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "consumerName" TEXT NOT NULL,
    "documentType" "ComplaintDocumentType" NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "guardianName" TEXT,
    "itemType" TEXT NOT NULL,
    "amount" DECIMAL(10,2),
    "itemDescription" TEXT NOT NULL,
    "type" "ComplaintType" NOT NULL,
    "detail" TEXT NOT NULL,
    "request" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedById" TEXT,
    "receiptEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "responseEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_number_key" ON "Complaint"("number");

-- CreateIndex
CREATE INDEX "Complaint_status_createdAt_idx" ON "Complaint"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Complaint_createdAt_idx" ON "Complaint"("createdAt");
