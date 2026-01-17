-- 1. Create TechnicalMetadata Table
CREATE TABLE "TechnicalMetadata" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentTypeId" TEXT,
    "topicId" TEXT,

    CONSTRAINT "TechnicalMetadata_pkey" PRIMARY KEY ("id")
);

-- 2. Migrate Data to TechnicalMetadata (Using Document.id as Metadata ID)
INSERT INTO "TechnicalMetadata" ("id", "documentId", "documentTypeId", "topicId")
SELECT "id", "id", "documentTypeId", "topicId" FROM "Document";

-- 3. Create Indexes for TechnicalMetadata
CREATE UNIQUE INDEX "TechnicalMetadata_documentId_key" ON "TechnicalMetadata"("documentId");
CREATE INDEX "TechnicalMetadata_documentId_idx" ON "TechnicalMetadata"("documentId");
CREATE INDEX "TechnicalMetadata_documentTypeId_idx" ON "TechnicalMetadata"("documentTypeId");
CREATE INDEX "TechnicalMetadata_topicId_idx" ON "TechnicalMetadata"("topicId");

-- 4. Alter Child Tables (Rename Columns instead of Drop/Add for Data Preservation)

-- DocumentOnMachineModel
ALTER TABLE "DocumentOnMachineModel" DROP CONSTRAINT "DocumentOnMachineModel_pkey";
ALTER TABLE "DocumentOnMachineModel" DROP CONSTRAINT "DocumentOnMachineModel_documentId_fkey";
ALTER TABLE "DocumentOnMachineModel" RENAME COLUMN "documentId" TO "technicalMetadataId";
ALTER TABLE "DocumentOnMachineModel" ADD CONSTRAINT "DocumentOnMachineModel_pkey" PRIMARY KEY ("technicalMetadataId", "machineModelId");

-- DocumentOnTag
ALTER TABLE "DocumentOnTag" DROP CONSTRAINT "DocumentOnTag_pkey";
ALTER TABLE "DocumentOnTag" DROP CONSTRAINT "DocumentOnTag_documentId_fkey";
ALTER TABLE "DocumentOnTag" RENAME COLUMN "documentId" TO "technicalMetadataId";
ALTER TABLE "DocumentOnTag" ADD CONSTRAINT "DocumentOnTag_pkey" PRIMARY KEY ("technicalMetadataId", "tagId");

-- Step
ALTER TABLE "Step" DROP CONSTRAINT "Step_documentId_fkey";
DROP INDEX "Step_documentId_order_key";
ALTER TABLE "Step" RENAME COLUMN "documentId" TO "technicalMetadataId";
CREATE UNIQUE INDEX "Step_technicalMetadataId_order_key" ON "Step"("technicalMetadataId", "order");

-- 5. Drop Old Columns from Document
ALTER TABLE "Document" DROP CONSTRAINT "Document_documentTypeId_fkey";
ALTER TABLE "Document" DROP CONSTRAINT "Document_topicId_fkey";
ALTER TABLE "Document" DROP COLUMN "documentTypeId";
ALTER TABLE "Document" DROP COLUMN "topicId";

-- 6. Add New Foreign Keys
ALTER TABLE "TechnicalMetadata" ADD CONSTRAINT "TechnicalMetadata_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TechnicalMetadata" ADD CONSTRAINT "TechnicalMetadata_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TechnicalMetadata" ADD CONSTRAINT "TechnicalMetadata_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "DocumentTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentOnMachineModel" ADD CONSTRAINT "DocumentOnMachineModel_technicalMetadataId_fkey" FOREIGN KEY ("technicalMetadataId") REFERENCES "TechnicalMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentOnTag" ADD CONSTRAINT "DocumentOnTag_technicalMetadataId_fkey" FOREIGN KEY ("technicalMetadataId") REFERENCES "TechnicalMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Step" ADD CONSTRAINT "Step_technicalMetadataId_fkey" FOREIGN KEY ("technicalMetadataId") REFERENCES "TechnicalMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Other Changes (Safe Adds/Modifications)

-- AuditLog
ALTER TABLE "AuditLog" ALTER COLUMN "payload" SET DATA TYPE TEXT;

-- Department
ALTER TABLE "Department" ADD COLUMN "code" TEXT NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE "Department" ADD COLUMN "description" TEXT;

-- User Role (Convert Enum to Text safely)
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE TEXT USING "role"::text;
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'TECHNICIAN';
DROP TYPE IF EXISTS "Role";

-- WorkSession (New Tables)
CREATE TABLE "WorkSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkSessionItem" (
    "id" TEXT NOT NULL,
    "workSessionId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progressJson" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WorkSessionItem_pkey" PRIMARY KEY ("id")
);

-- WorkSession Indexes
CREATE INDEX "WorkSession_userId_idx" ON "WorkSession"("userId");
CREATE INDEX "WorkSession_status_idx" ON "WorkSession"("status");
CREATE INDEX "WorkSessionItem_workSessionId_idx" ON "WorkSessionItem"("workSessionId");

-- Document Indexes
CREATE INDEX "Document_title_idx" ON "Document"("title");
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");
CREATE INDEX "Document_updatedAt_idx" ON "Document"("updatedAt");

-- WorkSession FKs
ALTER TABLE "WorkSession" ADD CONSTRAINT "WorkSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkSessionItem" ADD CONSTRAINT "WorkSessionItem_workSessionId_fkey" FOREIGN KEY ("workSessionId") REFERENCES "WorkSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkSessionItem" ADD CONSTRAINT "WorkSessionItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
