-- AlterTable
ALTER TABLE "SupportMessage" ADD COLUMN "courseId" TEXT,
                             ADD COLUMN "courseTitle" TEXT;

-- CreateIndex
CREATE INDEX "SupportMessage_courseId_idx" ON "SupportMessage"("courseId");

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
