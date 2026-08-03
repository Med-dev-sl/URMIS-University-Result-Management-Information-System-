import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PublicRoutes from '../routes/PublicRoutes.jsx'
import ProtectedRoutes from '../routes/ProtectedRoutes.jsx'
import RouteGuard from '../routes/RouteGuard.jsx'
import { permissions } from '../permissions/permissions.js'

const DashboardPage = lazy(() => import('../dashboard/DashboardPage.jsx'))
const StudentsPage = lazy(() => import('../students/StudentsView.jsx'))
const StaffPage = lazy(() => import('../staff/StaffView.jsx'))
const CoursesPage = lazy(() => import('../courses/CoursesView.jsx'))
const ResultsPage = lazy(() => import('../pages/ResultsPage.jsx'))
const ReportsPage = lazy(() => import('../pages/ReportsPage.jsx'))
const SettingsPage = lazy(() => import('../pages/SettingsPage.jsx'))
const PlatformPage = lazy(() => import('../platform/PlatformView.jsx'))
const SystemAdminPage = lazy(() => import('../system/SystemAdminView.jsx'))
const UniversityPage = lazy(() => import('../university/UniversityAdminView.jsx'))
const UserManagementPage = lazy(() => import('../users/UserManagementView.jsx'))
const AcademicStructurePage = lazy(() => import('../academic/AcademicStructureView.jsx'))
const StudentPage = lazy(() => import('../student/StudentView.jsx'))
const LecturerPage = lazy(() => import('../lecturer/LecturerView.jsx'))
const AssessmentPage = lazy(() => import('../assessment/AssessmentView.jsx'))
const RegistrationPage = lazy(() => import('../registrationFlow/RegistrationView.jsx'))
const DeanPage = lazy(() => import('../dean/DeanView.jsx'))
const HodPage = lazy(() => import('../hod/HodView.jsx'))
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx'))
const ApprovalPage = lazy(() => import('../approval/ApprovalView.jsx'))
const DocumentsPage = lazy(() => import('../documents/DocumentsView.jsx'))
const CommunicationPage = lazy(() => import('../communication/CommunicationView.jsx'))
const ExaminationPage = lazy(() => import('../examination/ExaminationView.jsx'))
const UnauthorizedPage = lazy(() => import('../pages/Unauthorized.jsx'))
const NotFoundPage = lazy(() => import('../pages/NotFound.jsx'))
const SessionExpiredPage = lazy(() => import('../pages/SessionExpired.jsx'))

function Router() {
  return (
    <Suspense fallback={<div className="loading-card">Loading page...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoutes />} />
        <Route path="/activate-account" element={<PublicRoutes />} />
        <Route path="/forgot-password" element={<PublicRoutes />} />
        <Route path="/reset-password" element={<PublicRoutes />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/profile" element={<RouteGuard permission={permissions.PROFILE_VIEW}><ProfilePage /></RouteGuard>} />
          <Route path="/dashboard/students" element={<RouteGuard permission={permissions.STUDENT_VIEW}><StudentsPage /></RouteGuard>} />
          <Route path="/dashboard/staff" element={<RouteGuard permission={[permissions.STAFF_CREATE, permissions.STAFF_VIEW]}><StaffPage /></RouteGuard>} />
          <Route path="/dashboard/courses" element={<RouteGuard permission={[permissions.COURSE_CREATE, permissions.COURSE_VIEW]}><CoursesPage /></RouteGuard>} />
          <Route path="/dashboard/results" element={<RouteGuard permission={permissions.RESULT_VIEW}><ResultsPage /></RouteGuard>} />
          <Route path="/dashboard/assessment" element={<RouteGuard permission={permissions.ASSESSMENT_VIEW}><AssessmentPage /></RouteGuard>} />
          <Route path="/dashboard/reports" element={<RouteGuard permission={permissions.REPORT_VIEW}><ReportsPage /></RouteGuard>} />
          <Route path="/dashboard/approval" element={<RouteGuard permission={permissions.RESULT_APPROVE}><ApprovalPage /></RouteGuard>} />
          <Route path="/dashboard/documents" element={<RouteGuard permission={permissions.DOCUMENT_VIEW}><DocumentsPage /></RouteGuard>} />
          <Route path="/dashboard/communication" element={<RouteGuard permission={permissions.NOTIFICATION_VIEW}><CommunicationPage /></RouteGuard>} />
          <Route path="/dashboard/settings" element={<RouteGuard permission={permissions.SETTINGS_VIEW}><SettingsPage /></RouteGuard>} />
          <Route path="/dashboard/examination" element={<RouteGuard permission={permissions.EXAM_MANAGE}><ExaminationPage /></RouteGuard>} />
          <Route path="/dashboard/student" element={<RouteGuard permission={permissions.STUDENT_PORTAL_VIEW}><StudentPage /></RouteGuard>} />
          <Route path="/dashboard/lecturer" element={<RouteGuard permission={permissions.LECTURER_VIEW}><LecturerPage /></RouteGuard>} />
          <Route path="/dashboard/registration" element={<RouteGuard permission={permissions.REGISTRATION_VIEW}><RegistrationPage /></RouteGuard>} />
          <Route path="/dashboard/dean" element={<RouteGuard permission={permissions.DEAN_VIEW}><DeanPage /></RouteGuard>} />
          <Route path="/dashboard/hod" element={<RouteGuard permission={permissions.HOD_VIEW}><HodPage /></RouteGuard>} />
          <Route path="/dashboard/platform" element={<RouteGuard permission={permissions.SYSTEM_VIEW}><PlatformPage /></RouteGuard>} />
          <Route path="/dashboard/system" element={<Navigate to="/dashboard/system/info" replace />} />
          <Route path="/dashboard/system/*" element={<RouteGuard permission={permissions.SYSTEM_MANAGE}><SystemAdminPage /></RouteGuard>} />
          <Route path="/dashboard/university" element={<RouteGuard permission={permissions.SYSTEM_VIEW}><UniversityPage /></RouteGuard>} />
          <Route path="/dashboard/users" element={<RouteGuard permission={permissions.USER_MANAGE}><UserManagementPage /></RouteGuard>} />
          <Route path="/dashboard/academics" element={<RouteGuard permission={[permissions.DEPARTMENT_VIEW, permissions.FACULTY_VIEW]}><AcademicStructurePage /></RouteGuard>} />
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/session-expired" element={<SessionExpiredPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default Router
