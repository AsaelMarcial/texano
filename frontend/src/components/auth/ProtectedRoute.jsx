import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function ProtectedRoute({ allowedRoles }) {
  const { token, user } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

