import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function ProtectedRoute({ allowedRoles }) {
  const { token, user } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.some(r => r.toLowerCase() === user?.rol?.toLowerCase())) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

