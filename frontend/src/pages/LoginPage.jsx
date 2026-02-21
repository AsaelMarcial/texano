import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { login } from '../services/endpoints'
import toast from 'react-hot-toast'
import logo from '../assets/graficos/TeXano.png'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await login(email, password)
      setAuth(data.access_token)
      toast.success('Bienvenido al POS Texano')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-texano-50 via-white to-primary-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-6 sm:mb-8 text-center">
          <img
            src={logo}
            alt="El Texano"
            className="mx-auto h-20 sm:h-24 w-auto object-contain drop-shadow-lg"
          />
          <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-gray-900">POS Texano</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500">Punto de Venta – Restaurante El Texano</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                placeholder="admin@texano.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-texano-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-texano-500 focus:ring-2 focus:ring-texano-300 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

