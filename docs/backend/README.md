# URMIS Backend Documentation

This document describes the current backend implementation for the University Result Management Information System (URMIS). It is based on the live Express application, Prisma schema, and route modules in the repository.

## 1. Overview

URMIS is a multi-institution academic platform that exposes a REST API for:

- authentication and user management
- student and staff records
- course and department management
- result entry and grade calculation
- assessment workflows
- registration and approval workflows
- document storage
- reporting and platform settings

The API is implemented in Node.js with Express and Prisma. The local runtime uses SQLite, and the server boots through [server/index.js](../../server/index.js) and the shared app factory in [server/app.js](../../server/app.js).

## 2. Runtime Architecture

### Core components

- Express app factory: [server/app.js](../../server/app.js)
- Server entrypoint: [server/index.js](../../server/index.js)
- Prisma client: [server/prisma.js](../../server/prisma.js)
- Authentication middleware: [server/shared/middlewares/auth.js](../../server/shared/middlewares/auth.js)
- RBAC service: [server/shared/services/rbacService.js](../../server/shared/services/rbacService.js)
- Auth service: [server/shared/services/authService.js](../../server/shared/services/authService.js)
- Prisma schema: [prisma/schema.prisma](../../prisma/schema.prisma)

### Request lifecycle

1. The Express app loads middleware, CORS, JSON parsing, and the audit logger.
2. Requests are routed to the relevant module under [server/routes](../../server/routes).
3. Authentication middleware validates access tokens and loads user context.
4. Route handlers interact with Prisma models and return normalized JSON responses.
5. Audit logging records the request path and method when available.

## 3. Project Structure

```text
server/
  app.js                # Express app factory and route mounting
  index.js              # HTTP server bootstrap
  prisma.js             # Prisma client initialization
  routes/               # Route modules by business domain
  shared/               # Auth, RBAC, services, middleware, security
prisma/
  schema.prisma         # Database schema and relations
  migrations/           # Prisma migration history
test/
  api.integration.test.js
```

## 4. API Route Map

### Health and root

- GET /api
- GET /api/health
- GET /api/dashboard

### Authentication

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/verify-email
- POST /api/auth/resend-verification
- POST /api/auth/password-reset/request
- POST /api/auth/password-reset/confirm

### Students and users

- GET /api/students
- POST /api/students
- PUT /api/students/:id
- DELETE /api/students/:id
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### Results and assessments

- GET /api/results
- POST /api/results
- PUT /api/results/:id
- DELETE /api/results/:id
- GET /api/assessments
- POST /api/assessments
- PUT /api/assessments/:id
- DELETE /api/assessments/:id
- POST /api/assessments/:id/publish
- POST /api/assessments/:id/approve
- POST /api/assessments/:id/request-correction

### Courses and academic structure

- GET /api/courses
- POST /api/courses
- PUT /api/courses/:id
- DELETE /api/courses/:id
- GET /api/departments
- POST /api/departments
- GET /api/faculties
- POST /api/faculties
- GET /api/modules
- POST /api/modules
- GET /api/academics/structure

### Registration and approval

- GET /api/registration
- POST /api/registration
- PUT /api/registration/:id
- DELETE /api/registration/:id
- POST /api/registration/:id/approve
- POST /api/registration/:id/reject
- POST /api/registration/periods
- PUT /api/registration/periods/:id
- GET /api/registration/periods
- GET /api/approval/workflows
- POST /api/approval/workflows
- GET /api/approval/tasks
- POST /api/approval/tasks
- POST /api/approval/tasks/:id/actions
- POST /api/approval/tasks/:id/comments
- GET /api/approval/publication-logs

### Documents, reports, communication, and platform

- GET /api/documents
- POST /api/documents
- GET /api/reports
- GET /api/communication
- GET /api/platform
- GET /api/settings
- GET /api/roles/roles
- GET /api/roles/permissions

## 5. Authentication and Authorization

### Authentication flow

1. A client sends credentials to POST /api/auth/login.
2. The server verifies the password and account state.
3. It issues an access token and a refresh token.
4. The access token is validated by the auth middleware on protected routes.
5. Refresh tokens can be used to rotate access tokens through POST /api/auth/refresh.

### Token behavior

- Access tokens are short-lived by default and expire in 15 minutes.
- Refresh tokens are longer-lived and expire in 7 days.
- The server stores a refresh token reference and can blacklist issued tokens.

### Authorization model

The backend uses Express middleware:

- requireAuth: verifies the session token.
- requireRole(...roles): allows only specific roles.
- requirePermission(permission): checks permission strings.
- requireTenantMatch(...): protects tenant-scoped routes.

### Supported roles

- super_admin
- admin
- examination_officer
- dean
- hod
- lecturer
- student

The RBAC service normalizes aliases like “super admin”, “exam officer”, and “staff” into the canonical role values used by the backend.

## 6. Roles and Permissions

Common permissions include:

- manage_users
- manage_roles
- manage_permissions
- manage_system
- manage_settings
- manage_documents
- manage_assessments
- manage_registrations
- manage_results
- view_reports
- view_students
- view_own_profile
- view_own_results
- view_own_documents
- view_own_registration

Default role mappings are defined in [server/shared/services/rbacService.js](../../server/shared/services/rbacService.js).

## 7. Database Model Overview

The Prisma schema defines the principal entities below:

- Institution
- User
- Faculty
- Department
- Programme
- AcademicSession
- Semester
- Level
- GradeScale
- GPAConfiguration
- Student
- Course
- Assessment
- AssessmentWeight
- AssessmentScore
- Module
- Result
- TranscriptRequest
- Transcript
- Notification
- UploadedDocument
- DocumentFolder
- Document
- DocumentVersion
- InstitutionSetting
- RegistrationPeriod
- Registration
- RegistrationCourse
- ApprovalWorkflow
- ApprovalStage
- ApprovalTask
- ApprovalHistory
- ApprovalComment
- PublicationLog
- AuditLog

### Important relationships

- An Institution has many Users, Students, Courses, Results, and workflows.
- A Student belongs to one Institution and optionally one Department.
- A Course belongs to one Institution and optionally one Department.
- A Result links a Student, a Course, and an Institution.
- A Registration belongs to a Student, a RegistrationPeriod, and an Institution.
- Approval tasks are tied to workflows and publication logs.

## 8. Core Workflows

### Result publication workflow

1. A lecturer or admin creates an assessment.
2. Marks are recorded as assessment scores.
3. The assessment can be published, approved, or sent for correction.
4. Result records can be created and queried through the results endpoints.

### Registration workflow

1. Admin creates a registration period.
2. Student submits a registration with selected courses.
3. HOD, Examination Officer, or Admin approves or rejects it.
4. Approval state is stored on the registration record.

### Approval workflow

1. An approval workflow is created with one or more stages.
2. Approval tasks are created for the target resource.
3. Users advance the task through stages by posting actions.
4. Comments and publication logs can be attached to the task.

## 9. Configuration and Environment Variables

The backend reads configuration from environment variables and from the local .env file.

| Variable | Purpose | Default |
| --- | --- | --- |
| PORT | HTTP port | 5000 |
| CLIENT_ORIGIN | Allowed frontend origin | http://localhost:5173 |
| DATABASE_URL | Prisma database URL | file:./data/urmis-prisma.db |
| JWT_SECRET | Access token signing secret | urmis-access-secret |
| JWT_REFRESH_SECRET | Refresh token signing secret | urmis-refresh-secret |
| JWT_ACCESS_EXPIRES_IN | Access token expiry | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 7d |
| AUTH_LOCKOUT_THRESHOLD | Failed login threshold | 5 |
| AUTH_LOCKOUT_DURATION_MINUTES | Lockout window | 15 |
| REQUIRE_EMAIL_VERIFICATION | Require verified email before login | false |
| NODE_ENV | Runtime mode | development |

## 10. Local Development

### Install dependencies

```bash
npm install
```

### Run the backend

```bash
npm run dev:server
```

### Run the full app

```bash
npm run dev
```

### Run the test suite

```bash
npm test
```

### Regenerate Prisma client

```bash
npm run prisma:generate
```

## 11. Example Requests and Responses

### Login

Request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@greenfield.edu",
  "password": "Admin@123"
}
```

Response:

```json
{
  "user": {
    "id": 1,
    "full_name": "Aisha Bello",
    "email": "admin@greenfield.edu",
    "role": "admin"
  },
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

### Create a result

Request:

```http
POST /api/results
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "student_id": 1,
  "course_id": 1,
  "assignment_score": 88,
  "exam_score": 91,
  "academic_session": "2024/2025"
}
```

Response:

```json
{
  "id": 1,
  "student_id": 1,
  "course_id": 1,
  "assignment_score": 88,
  "exam_score": 91,
  "total_score": 179,
  "percentage": 90,
  "grade": "A",
  "pass_fail": "PASS"
}
```

### Create a registration period

```http
POST /api/registration/periods
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "2024/2025 First Semester",
  "academicSession": "2024/2025",
  "status": "open",
  "maxCreditUnits": 24
}
```

## 12. Error Handling and Status Codes

Common response patterns:

- 400: invalid input or malformed payload
- 401: missing or invalid authentication token
- 403: insufficient role or permissions
- 404: resource not found
- 409: duplicate registration or conflicting state
- 500: unexpected server error

The API returns JSON error messages like:

```json
{
  "message": "Email and password are required"
}
```

## 13. Swagger / OpenAPI

The OpenAPI definition for the main public API surface is available in [docs/backend/openapi.yaml](./openapi.yaml). It can be used with Swagger UI, Redoc, or other OpenAPI tooling.

## 14. Deployment Notes

The current implementation is suitable for local development and can be deployed to a Node.js host with:

- a persistent SQLite file or a migrated PostgreSQL/MySQL datasource
- environment variables configured for secrets and origins
- the Prisma client generated for the target environment

A production deployment should also secure the JWT secrets, enable HTTPS, and consider switching from SQLite to a managed relational database.
