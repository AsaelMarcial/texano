import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MesasPage from './pages/MesasPage'
import CategoriasPage from './pages/CategoriasPage'
import ProductosPage from './pages/ProductosPage'
import OrdenesPage from './pages/OrdenesPage'
import PagosPage from './pages/PagosPage'
import CorteCajaPage from './pages/CorteCajaPage'
import UsuariosPage from './pages/UsuariosPage'

function App() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/mesas" element={<MesasPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/pagos" element={<PagosPage />} />

          {/* Solo Administrador */}
          <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
            <Route path="/cortes-caja" element={<CorteCajaPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
