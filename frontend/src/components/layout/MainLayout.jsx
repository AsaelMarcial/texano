import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import logo from '../../assets/graficos/TeXano.png'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  TableCellsIcon,
  TagIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  CalculatorIcon,
  UsersIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Mesas', to: '/mesas', icon: TableCellsIcon },
  { name: 'Menú', to: '/productos', icon: ShoppingBagIcon },
  { name: 'Categorías', to: '/categorias', icon: TagIcon },
  { name: 'Órdenes', to: '/ordenes', icon: ClipboardDocumentListIcon },
  { name: 'Pagos', to: '/pagos', icon: CreditCardIcon },
  { name: 'Corte de Caja', to: '/cortes-caja', icon: CalculatorIcon },
  { name: 'Usuarios', to: '/usuarios', icon: UsersIcon, roles: ['Administrador'] },
]

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredNav = navigation.filter(
    (item) => !item.roles || item.roles.includes(user?.rol),
  )

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar Overlay (móvil) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="El Texano" className="h-9 w-9 object-contain" />
            <span className="text-lg font-bold text-gray-900">POS Texano</span>
          </div>
          <button
            className="lg:hidden rounded-md p-1 text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={linkClasses}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.rol || 'Rol'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Cerrar sesión"
            >
              <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
          <button
            className="lg:hidden rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-gray-500">El Texano – Punto de Venta</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


