-- CreateTable
CREATE TABLE "Assessment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "academicSession" TEXT NOT NULL,
    "semester" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "publishedAt" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Assessment_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Assessment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentWeight" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assessmentId" INTEGER NOT NULL,
    "component" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssessmentWeight_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssessmentScore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assessmentId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "institutionId" INTEGER,
    "caScore" REAL,
    "assignmentScore" REAL,
    "practicalScore" REAL,
    "examScore" REAL,
    "finalMark" REAL,
    "grade" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AssessmentScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssessmentScore_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssessmentScore_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentWeight_assessmentId_component_key" ON "AssessmentWeight"("assessmentId", "component");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentScore_assessmentId_studentId_key" ON "AssessmentScore"("assessmentId", "studentId");
