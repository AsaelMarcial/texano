import { useEffect, useState } from 'react'
import {
  TableCellsIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { getMesas, getProductos, getOrdenes } from '../services/endpoints'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const statCards = [
  { key: 'mesas', label: 'Mesas', icon: TableCellsIcon, color: 'bg-blue-500' },
  { key: 'productos', label: 'Productos', icon: ShoppingBagIcon, color: 'bg-green-500' },
  { key: 'ordenes', label: 'Órdenes hoy', icon: ClipboardDocumentListIcon, color: 'bg-purple-500' },
  { key: 'ventas', label: 'Ventas hoy', icon: CurrencyDollarIcon, color: 'bg-texano-400', isMoney: true },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({ mesas: 0, productos: 0, ordenes: 0, ventas: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mesasRes, prodRes, ordenesRes] = await Promise.all([
          getMesas(0, 1000),
          getProductos(0, 1000),
          getOrdenes(0, 1000),
        ])

        const ordenes = ordenesRes.data
        const hoy = new Date().toISOString().slice(0, 10)
        const ordenesHoy = ordenes.filter((o) => o.creado_en?.slice(0, 10) === hoy)
        const ventasHoy = ordenesHoy
          .filter((o) => o.estado === 'pagada')
          .reduce((sum, o) => sum + parseFloat(o.total || 0), 0)

        setStats({
          mesas: mesasRes.data.length,
          productos: prodRes.data.length,
          ordenes: ordenesHoy.length,
          ventas: ventasHoy,
        })
      } catch {
        // silencioso
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <LoadingSpinner className="mt-32" size="lg" />

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="flex items-center gap-3 sm:gap-4 rounded-xl bg-white p-3 sm:p-5 shadow-sm ring-1 ring-gray-200"
          >
            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg ${card.color} text-white shrink-0`}>
              <card.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">{card.label}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {card.isMoney
                  ? `$${stats[card.key].toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                  : stats[card.key]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for charts */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Órdenes recientes</h2>
          <p className="text-sm text-gray-400">Las gráficas se pueden agregar aquí con Recharts.</p>
        </div>
        <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Estado de mesas</h2>
          <p className="text-sm text-gray-400">Vista rápida del estado actual de las mesas.</p>
        </div>
      </div>
    </div>
  )
}


