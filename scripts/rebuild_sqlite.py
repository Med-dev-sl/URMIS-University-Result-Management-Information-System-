import os
import sqlite3

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
db_path = os.path.join(base_dir, 'data', 'urmis-prisma.db')
os.makedirs(os.path.dirname(db_path), exist_ok=True)

if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.executescript('''
CREATE TABLE IF NOT EXISTS "Institution" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "contact_email" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "User" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "institutionId" INTEGER,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
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
  CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "RolePermission" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "role" TEXT NOT NULL,
  "permission" TEXT NOT NULL,
  "granted" BOOLEAN NOT NULL DEFAULT true,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RolePermission_role_permission_key" UNIQUE ("role", "permission")
);
CREATE TABLE IF NOT EXISTS "Faculty" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "institutionId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Faculty_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Department" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "institutionId" INTEGER NOT NULL,
  "facultyId" INTEGER,
  "name" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Department_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Department_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Student" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "institutionId" INTEGER NOT NULL,
  "student_id" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "departmentId" INTEGER,
  "semester" TEXT,
  "enrollment_year" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Student_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Course" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "institutionId" INTEGER NOT NULL,
  "departmentId" INTEGER,
  "course_code" TEXT NOT NULL,
  "course_name" TEXT NOT NULL,
  "credit_hours" INTEGER NOT NULL DEFAULT 3,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Course_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Module" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "institutionId" INTEGER NOT NULL,
  "courseId" INTEGER NOT NULL,
  "module_code" TEXT NOT NULL,
  "module_name" TEXT NOT NULL,
  "credit_hours" INTEGER NOT NULL DEFAULT 1,
  "description" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Module_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Result" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "institutionId" INTEGER NOT NULL,
  "studentId" INTEGER NOT NULL,
  "courseId" INTEGER NOT NULL,
  "assignment_score" REAL NOT NULL,
  "exam_score" REAL NOT NULL,
  "total_score" REAL NOT NULL,
  "percentage" REAL NOT NULL,
  "grade" TEXT NOT NULL,
  "pass_fail" TEXT NOT NULL,
  "academic_session" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Result_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Result_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
''')
conn.commit()
conn.close()
print('sqlite schema rebuilt at', db_path)
