# URMIS Backend Architecture

This document describes the backend architecture for the URMIS platform, aligned with `README.md`, `DATABASE_STRUCTURE.md`, and `PROJECT_STRUCTURE.md`.

## Architecture Layers

- API Layer: Express routes under `server/routes/` for domain modules.
- Shared Infrastructure: reusable services, models, middleware, security, constants, and utilities in `server/shared/`.
- Persistence Layer: SQLite database access via `server/db.js` and data model definitions.
- Seed/Data Layer: demo seed data is created in `server/index.js`.

## Core Backend Modules

### Platform
- Multi-tenant institutions
- Subscription and plan management
- Platform settings, audit/activity logs
- System administrator operations

### Authentication
- User login, password management, sessions, refresh tokens
- Roles and permissions
- JWT/session handling
- Account verification and access control

### Registration
- Institution creation and onboarding
- Staff and student registration
- Token issuance, activation, verification
- Registration logs and lifecycle states

### Institution Management
- Faculties and departments
- Programmes, academic sessions, semesters, levels
- Academic calendar and institution metadata

### Staff Management
- Staff profiles and employment records
- Lecturer, dean, HoD, exam officer, and admin roles
- Role assignment, department affiliation, access control

### Student Management
- Student profiles and admissions
- Programme allocation, enrollment, academic history
- Institution-aware student records

### Course Management
- Courses, course assignments, registration, prerequisites
- Department and institution scoping
- Course modules and curriculum components

### Assessment Management
- Assessment types, assessment entries, and scores
- Continuous assessment, mid-semester, practicals, projects, exam scores
- Validation and grade calculation logic

### Result Management
- Results, semester/yearly/cumulative records
- Grade rules, grading systems, classification
- GPA and CGPA processing, percentage/grade assignment

### Examination Office
- Transcript requests and generation
- Result slips, statement of results, graduation lists
- Carry-over/resit/supplementary handling
- Graduation clearance workflow

### Approval Workflow
- Multi-stage approval pipelines for submission → review → publication
- Approval workflows, stages, history, comments, publication logs

### Documents
- Generated documents, templates, downloads
- Digital signature state and document archive

### Communication
- Notifications, announcements, internal messages
- Email and SMS logging

### Reports
- Student, departmental, faculty, and graduation reports
- Transcript reporting, analytics, dashboard statistics

### Settings
- Institution settings, grading system configuration
- Academic policy configuration, document templates, system preferences

## Existing Implementation Snapshot

- `server/index.js`: Express app setup, demo seed data, route registration
- `server/db.js`: SQLite schema initialization and query helpers
- `server/routes/students.js`: student listing and creation
- `server/routes/results.js`: result listing and creation with grade logic
- `server/routes/courses/courses.js`: course listing and creation
- `server/routes/courses/modules.js`: module listing and creation
- `server/routes/institution/departments.js`: department listing and creation
- `server/routes/institution/faculties.js`: faculty listing and creation

## Backend Architecture Completion Plan

1. Create a domain route structure for every major module.
2. Add shared infrastructure files for models, services, middleware, security, constants, and utilities.
3. Introduce a service layer that separates business logic from route handlers.
4. Add tenant-aware request handling and role-based access control middleware.
5. Expand database schema to cover platform, security, registration, staff, assessment, approval, and document tables.

## Notes

- The current backend is MVP-focused and already has the core multi-tenancy pattern with `institution_id` on major tables.
- The completed architecture will also support future scaling to PostgreSQL/MySQL.
- Shared backend directories should contain domain-aware logic and cross-cutting middleware.
