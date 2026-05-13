-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "customDescription" TEXT,
ADD COLUMN     "holderCompany" TEXT,
ADD COLUMN     "holderDni" TEXT,
ADD COLUMN     "holderName" TEXT,
ALTER COLUMN "enrollmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "certificateDescription" TEXT;

-- CreateIndex
CREATE INDEX "Certificate_courseId_idx" ON "Certificate"("courseId");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
