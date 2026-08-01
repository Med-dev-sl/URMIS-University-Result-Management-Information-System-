-- CreateTable
CREATE TABLE "DocumentFolder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "parentFolderId" INTEGER,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DocumentFolder_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DocumentFolder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DocumentFolder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "DocumentFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "folderId" INTEGER,
    "uploadedBy" INTEGER NOT NULL,
    "faculty" TEXT,
    "department" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Document_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "DocumentFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "documentId" INTEGER NOT NULL,
    "uploadedBy" INTEGER NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "changeSummary" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentVersion_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DocumentVersion_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_documentId_versionNumber_key" ON "DocumentVersion"("documentId", "versionNumber");
