-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "topicId" TEXT;

-- CreateTable
CREATE TABLE "DocumentTopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "DocumentTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTopic_slug_key" ON "DocumentTopic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTopic_categoryId_name_key" ON "DocumentTopic"("categoryId", "name");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "DocumentTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTopic" ADD CONSTRAINT "DocumentTopic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
