import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PrinterIcon } from '@heroicons/react/24/outline'
import { getPagos, getOrden } from '../services/endpoints'
import PageHeader from '../components/ui/PageHeader'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { printTicketPago } from '../utils/printTicket'

export default function PagosPage() {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const pagosRes = await getPagos(0, 500)
      setPagos(pagosRes.data)
    } catch {
      toast.error('Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <LoadingSpinner className="mt-32" size="lg" />

  return (
    <div>
      <PageHeader title="Ventas" subtitle={`${pagos.length} ventas registradas`}>
      </PageHeader>

      {/* Vista móvil: Cards */}
      <div className="space-y-3 md:hidden">
        {pagos.map((pago) => (
          <div key={pago.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Orden <b className="text-gray-900">#{pago.orden_id}</b></span>
              <span className="text-lg font-bold text-green-700">${parseFloat(pago.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="capitalize">{pago.metodo_pago}</span>
              <span>{new Date(pago.creado_en).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {pago.referencia && <p className="text-xs text-gray-400 mt-1">Ref: {pago.referencia}</p>}
            <div className="mt-2 border-t border-gray-100 pt-2">
              <button
                onClick={async () => {
                  try {
                    const { data: ord } = await getOrden(pago.orden_id)
                    printTicketPago(ord, { metodo_pago: pago.metodo_pago, monto: parseFloat(pago.monto) })
                  } catch { toast.error('Error al reimprimir ticket') }
                }}
                className="w-full rounded-lg bg-gray-50 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              >
                🖨️ Reimprimir ticket
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista desktop: Tabla */}
      <div className="hidden md:block overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Orden</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Monto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Método</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Referencia</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Ticket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagos.map((pago) => (
              <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{pago.id}</td>
                <td className="px-4 py-3 text-sm text-gray-500">#{pago.orden_id}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-green-700">${parseFloat(pago.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-sm text-gray-500 capitalize">{pago.metodo_pago}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{pago.referencia || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(pago.creado_en).toLocaleString('es-MX')}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={async () => {
                      try {
                        const { data: ord } = await getOrden(pago.orden_id)
                        printTicketPago(ord, { metodo_pago: pago.metodo_pago, monto: parseFloat(pago.monto) })
                      } catch { toast.error('Error al reimprimir ticket') }
                    }}
                    className="rounded-md p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600"
                    title="Reimprimir ticket"
                  >
                    <PrinterIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
