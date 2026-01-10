-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentOnDepartment" (
    "documentId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "DocumentOnDepartment_pkey" PRIMARY KEY ("documentId","departmentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- AddForeignKey
ALTER TABLE "DocumentOnDepartment" ADD CONSTRAINT "DocumentOnDepartment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentOnDepartment" ADD CONSTRAINT "DocumentOnDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
