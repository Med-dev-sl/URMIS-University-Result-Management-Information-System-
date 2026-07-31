# URMIS DATABASE STRUCTURE

## A. Platform Tables (System Administrator Only)
These tables belong to the SaaS platform and are **not tied to any university**.

```
Platform

• institutions
• institution_settings
• subscription_plans
• subscriptions
• platform_settings
• system_administrators
• audit_logs
• activity_logs
• login_logs
• notifications
• announcements
• support_tickets
• api_keys
```

---

## B. Security, Access Control & Registration

```
Authentication

• users
• roles
• permissions
• role_permissions
• user_sessions
• refresh_tokens
• password_reset_tokens
• email_verifications
• two_factor_authentication
```
Every user belongs to one institution except the System Administrator.

URMIS does not allow open public registration. Every account originates from an authorized institution, either by the System Administrator or by the University Administrator.

```
Registration

• registrations
• registration_tokens
• account_activations
• email_verifications
• activation_logs
```

```
Staff

• staff_profiles
• staff_employment
• staff_departments
• staff_roles
```

```
Students

• student_profiles
• student_admissions
• student_identity_verifications
```

Accounts have a lifecycle with statuses such as Created, Pending Activation, Activated, Active, Suspended, Locked, and Archived.

---

## C. Institution Management

```
Institution

• faculties
• departments
• programmes
• academic_sessions
• semesters
• levels
• academic_calendar
```

---

## D. Staff Management

```
Staff

• staff_profiles
• lecturers
• deans
• hods
• exam_officers
• university_administrators
```

---

## E. Student Management

```
Students

• students
• student_profiles
• student_registrations
• student_programmes
• student_levels
• student_status
```

---

## F. Course Management

```
Courses

• courses
• course_assignments
• course_registrations
• prerequisite_courses
```

> **course_assignments** is managed by the **Head of Department**.

---

## G. Assessment Management

```
Assessments

• assessment_types
• assessments
• assessment_scores
```
Examples

```
Assignment

Quiz

Mid Semester

Practical

Project

Exam
```

---

## H. Result Management

```
Results

• results
• semester_results
• yearly_results
• cumulative_results
• grade_rules
• grading_systems
• grading_scales
• classifications
```

---

## I. Examination Office

```
Examination

• transcript_requests
• transcripts
• result_slips
• statement_of_results
• graduation_lists
• graduation_status
• carry_over_courses
• resit_courses
• supplementary_results
• graduation_clearance
```
Only the **Exam Officer** manages these.

---

## J. Approval Workflow

```
Approval

• approval_workflows
• approval_stages
• approval_history
• approval_comments
• publication_logs
```
Workflow

```
Lecturer

↓

HoD

↓

Dean

↓

Exam Officer

↓

Published
```

---

## K. Academic Documents

```
Documents

• generated_documents
• document_templates
• document_downloads
• digital_signatures
```

---

## L. Communication

```
Communication

• notifications
• announcements
• internal_messages
• emails
• sms_logs
```

---

## M. Reporting

```
Reports

• dashboard_statistics

• student_statistics

• faculty_statistics

• department_statistics

• course_statistics

• performance_reports

• graduation_reports

• transcript_reports
```

---

## N. Audit & Monitoring

```
Audit

• audit_logs

• error_logs

• activity_logs

• login_history

• system_events
```

---

## O. Shared Rule
Every university table contains

```
institution_id
```
except

```
institutions

subscription_plans

subscriptions

platform_settings

system_administrators
```
This is what isolates every university while using one shared database.
