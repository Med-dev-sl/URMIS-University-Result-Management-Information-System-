import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PublicRoutes from '../routes/PublicRoutes.jsx'
import ProtectedRoutes from '../routes/ProtectedRoutes.jsx'
import RouteGuard from '../routes/RouteGuard.jsx'

const DashboardPage = lazy(() => import('../dashboard/DashboardPage.jsx'))
const StudentsPage = lazy(() => import('../pages/StudentsPage.jsx'))
const ResultsPage = lazy(() => import('../pages/ResultsPage.jsx'))
const ReportsPage = lazy(() => import('../pages/ReportsPage.jsx'))
const SettingsPage = lazy(() => import('../pages/SettingsPage.jsx'))
const PlatformPage = lazy(() => import('../platform/PlatformView.jsx'))
const UniversityPage = lazy(() => import('../university/UniversityAdminView.jsx'))
const UserManagementPage = lazy(() => import('../users/UserManagementView.jsx'))
const AcademicStructurePage = lazy(() => import('../academic/AcademicStructureView.jsx'))
const StudentPage = lazy(() => import('../student/StudentView.jsx'))
const LecturerPage = lazy(() => import('../lecturer/LecturerView.jsx'))
const AssessmentPage = lazy(() => import('../assessment/AssessmentView.jsx'))
const RegistrationPage = lazy(() => import('../registrationFlow/RegistrationView.jsx'))
const DeanPage = lazy(() => import('../dean/DeanView.jsx'))
const HodPage = lazy(() => import('../hod/HodView.jsx'))
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
          <Route path="/dashboard/profile" element={<DashboardPage />} />
          <Route path="/dashboard/students" element={<RouteGuard permission="student:view"><StudentsPage /></RouteGuard>} />
          <Route path="/dashboard/staff" element={<RouteGuard permission="staff:create"><DashboardPage /></RouteGuard>} />
          <Route path="/dashboard/courses" element={<RouteGuard permission="course:create"><DashboardPage /></RouteGuard>} />
          <Route path="/dashboard/results" element={<RouteGuard permission="result:view"><ResultsPage /></RouteGuard>} />
          <Route path="/dashboard/reports" element={<RouteGuard permission="report:view"><ReportsPage /></RouteGuard>} />
          <Route path="/dashboard/settings" element={<RouteGuard permission="profile:view"><SettingsPage /></RouteGuard>} />
          <Route path="/dashboard/student" element={<RouteGuard permission="profile:view"><StudentPage /></RouteGuard>} />
          <Route path="/dashboard/lecturer" element={<RouteGuard permission="result:view"><LecturerPage /></RouteGuard>} />
          <Route path="/dashboard/assessment" element={<RouteGuard permission="result:view"><AssessmentPage /></RouteGuard>} />
          <Route path="/dashboard/registration" element={<RouteGuard permission="profile:view"><RegistrationPage /></RouteGuard>} />
          <Route path="/dashboard/dean" element={<RouteGuard permission="result:approve"><DeanPage /></RouteGuard>} />
          <Route path="/dashboard/hod" element={<RouteGuard permission="result:approve"><HodPage /></RouteGuard>} />
          <Route path="/dashboard/platform" element={<RouteGuard permission="system:view"><PlatformPage /></RouteGuard>} />
          <Route path="/dashboard/university" element={<RouteGuard permission="system:view"><UniversityPage /></RouteGuard>} />
          <Route path="/dashboard/users" element={<RouteGuard permission="system:view"><UserManagementPage /></RouteGuard>} />
          <Route path="/dashboard/academics" element={<RouteGuard permission="system:view"><AcademicStructurePage /></RouteGuard>} />
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
