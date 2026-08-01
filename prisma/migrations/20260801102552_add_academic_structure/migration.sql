-- CreateTable
CREATE TABLE "RolePermission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Programme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "facultyId" INTEGER,
    "departmentId" INTEGER,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationYears" INTEGER NOT NULL DEFAULT 4,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Programme_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Programme_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Programme_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcademicSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AcademicSession_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "academicSessionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Semester_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Semester_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Level" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Level_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GradeScale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "gradeLetter" TEXT NOT NULL,
    "minimumScore" REAL NOT NULL,
    "maximumScore" REAL NOT NULL,
    "gradePoint" REAL NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "GradeScale_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GPAConfiguration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default GPA',
    "gradingBasis" TEXT NOT NULL DEFAULT '4.0',
    "minimumPassingGrade" TEXT NOT NULL DEFAULT 'D',
    "maxCreditLoad" INTEGER NOT NULL DEFAULT 24,
    "includeCarryOver" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "GPAConfiguration_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "refresh_token" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" DATETIME,
    "suspendedAt" DATETIME,
    "lastPasswordChange" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("created_at", "email", "full_name", "id", "institutionId", "password_hash", "refresh_token", "role") SELECT "created_at", "email", "full_name", "id", "institutionId", "password_hash", "refresh_token", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "departmentId" INTEGER,
    "programmeId" INTEGER,
    "course_code" TEXT NOT NULL,
    "course_name" TEXT NOT NULL,
    "credit_hours" INTEGER NOT NULL DEFAULT 3,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Course_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Course_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("course_code", "course_name", "created_at", "credit_hours", "departmentId", "id", "institutionId") SELECT "course_code", "course_name", "created_at", "credit_hours", "departmentId", "id", "institutionId" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_permission_key" ON "RolePermission"("role", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "Programme_institutionId_code_key" ON "Programme"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_institutionId_name_key" ON "AcademicSession"("institutionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_academicSessionId_code_key" ON "Semester"("academicSessionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Level_institutionId_code_key" ON "Level"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "GradeScale_institutionId_gradeLetter_key" ON "GradeScale"("institutionId", "gradeLetter");

-- CreateIndex
CREATE UNIQUE INDEX "GPAConfiguration_institutionId_name_key" ON "GPAConfiguration"("institutionId", "name");
