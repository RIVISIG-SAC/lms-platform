-- CreateTable
CREATE TABLE "SystemFaq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemFaq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SystemFaq_published_order_idx" ON "SystemFaq"("published", "order");
