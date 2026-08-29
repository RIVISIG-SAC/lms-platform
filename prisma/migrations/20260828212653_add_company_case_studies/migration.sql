-- CreateEnum
CREATE TYPE "CompanyImageSection" AS ENUM ('ABOUT', 'GALLERY');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sector" TEXT,
    "logoUrl" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "heroTitle" TEXT NOT NULL,
    "heroHighlight" TEXT,
    "heroSubtitle" TEXT,
    "heroImageUrl" TEXT,
    "aboutContent" TEXT NOT NULL,
    "fullAddress" TEXT,
    "challengeText" TEXT,
    "challengeImageUrl" TEXT,
    "leadershipText" TEXT,
    "leadershipImageUrl" TEXT,
    "teamworkText" TEXT,
    "teamworkImageUrl" TEXT,
    "testimonialVimeoId" TEXT,
    "testimonialQuote" TEXT,
    "testimonialAuthorName" TEXT,
    "testimonialAuthorRole" TEXT,
    "fichaLocation" TEXT,
    "fichaClientName" TEXT,
    "fichaRuc" TEXT,
    "fichaProjectScope" TEXT,
    "fichaCertificationYear" TEXT,
    "fichaProjectStatus" TEXT,
    "fichaAccompaniment" TEXT,
    "closingMessage" TEXT,
    "closingImageUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyFact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyService" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAchievement" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAward" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCertification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "standard" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyImage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "section" "CompanyImageSection" NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_status_publishedAt_idx" ON "Company"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "CompanyFact_companyId_order_idx" ON "CompanyFact"("companyId", "order");

-- CreateIndex
CREATE INDEX "CompanyService_companyId_order_idx" ON "CompanyService"("companyId", "order");

-- CreateIndex
CREATE INDEX "CompanyAchievement_companyId_order_idx" ON "CompanyAchievement"("companyId", "order");

-- CreateIndex
CREATE INDEX "CompanyAward_companyId_order_idx" ON "CompanyAward"("companyId", "order");

-- CreateIndex
CREATE INDEX "CompanyCertification_companyId_order_idx" ON "CompanyCertification"("companyId", "order");

-- CreateIndex
CREATE INDEX "CompanyImage_companyId_section_order_idx" ON "CompanyImage"("companyId", "section", "order");

-- AddForeignKey
ALTER TABLE "CompanyFact" ADD CONSTRAINT "CompanyFact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyService" ADD CONSTRAINT "CompanyService_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAchievement" ADD CONSTRAINT "CompanyAchievement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAward" ADD CONSTRAINT "CompanyAward_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCertification" ADD CONSTRAINT "CompanyCertification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyImage" ADD CONSTRAINT "CompanyImage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
