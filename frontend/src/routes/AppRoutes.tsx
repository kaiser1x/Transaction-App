import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import PublicLayout from '../layouts/PublicLayout'
import DashboardPage from '../pages/admin/DashboardPage'
import PaymentPageEditorPage from '../pages/admin/PaymentPageEditorPage'
import PaymentPagesPage from '../pages/admin/PaymentPagesPage'
import ReportsPage from '../pages/admin/ReportsPage'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
import MyPaymentsPage from '../pages/payer/MyPaymentsPage'
import PaymentOptionsPage from '../pages/payer/PaymentOptionsPage'
import PaymentDisabledPage from '../pages/public/PaymentDisabledPage'
import PaymentFailurePage from '../pages/public/PaymentFailurePage'
import PaymentSuccessPage from '../pages/public/PaymentSuccessPage'
import LandingPage from '../pages/public/LandingPage'
import PublicPaymentPage from '../pages/public/PublicPaymentPage'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route element={<RoleRoute allowedRole="payer" />}>
            <Route path="payment-options" element={<PaymentOptionsPage />} />
            <Route path="my-payments" element={<MyPaymentsPage />} />
          </Route>
          <Route element={<RoleRoute allowedRole="admin" />}>
            <Route path="payment-pages" element={<PaymentPagesPage />} />
            <Route path="payment-pages/new" element={<PaymentPageEditorPage />} />
            <Route path="payment-pages/:id/edit" element={<PaymentPageEditorPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/pay/:slug" element={<PublicPaymentPage />} />
        <Route path="/pay/:slug/success" element={<PaymentSuccessPage />} />
        <Route path="/pay/:slug/failure" element={<PaymentFailurePage />} />
        <Route path="/pay/:slug/disabled" element={<PaymentDisabledPage />} />
      </Route>

      <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin/payment-pages" element={<Navigate to="/dashboard/payment-pages" replace />} />
      <Route path="/admin/payment-pages/new" element={<Navigate to="/dashboard/payment-pages/new" replace />} />
      <Route path="/admin/payment-pages/:id/edit" element={<Navigate to="/dashboard/payment-pages" replace />} />
      <Route path="/admin/reports" element={<Navigate to="/dashboard/reports" replace />} />
    </Routes>
  )
}
