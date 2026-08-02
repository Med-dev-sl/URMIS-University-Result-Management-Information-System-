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
          <Route path="/dashboard/platform" element={<RouteGuard permission="system:view"><PlatformPage /></RouteGuard>} />
          <Route path="/dashboard/university" element={<RouteGuard permission="system:view"><UniversityPage /></RouteGuard>} />
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
