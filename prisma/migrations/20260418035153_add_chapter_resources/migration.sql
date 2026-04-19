-- CreateTable
CREATE TABLE "ChapterResource" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PDF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChapterResource_chapterId_idx" ON "ChapterResource"("chapterId");

-- AddForeignKey
ALTER TABLE "ChapterResource" ADD CONSTRAINT "ChapterResource_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
