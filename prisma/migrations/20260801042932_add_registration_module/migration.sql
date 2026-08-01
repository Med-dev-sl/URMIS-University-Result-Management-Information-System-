-- CreateTable
CREATE TABLE "RegistrationPeriod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "academicSession" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "openedAt" DATETIME,
    "closedAt" DATETIME,
    "maxCreditUnits" INTEGER NOT NULL DEFAULT 24,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "RegistrationPeriod_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "institutionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "registrationPeriodId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalCreditUnits" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" DATETIME,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "rejectionReason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Registration_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Registration_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Registration_registrationPeriodId_fkey" FOREIGN KEY ("registrationPeriodId") REFERENCES "RegistrationPeriod" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegistrationCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "registrationId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "creditUnits" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistrationCourse_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegistrationCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationPeriod_institutionId_academicSession_name_key" ON "RegistrationPeriod"("institutionId", "academicSession", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_studentId_registrationPeriodId_key" ON "Registration"("studentId", "registrationPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationCourse_registrationId_courseId_key" ON "RegistrationCourse"("registrationId", "courseId");
