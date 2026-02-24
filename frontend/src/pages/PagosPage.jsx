import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { PrinterIcon, EyeIcon } from '@heroicons/react/24/outline'
import { getPagos, getOrden } from '../services/endpoints'
import PageHeader from '../components/ui/PageHeader'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Modal from '../components/ui/Modal'
import { printTicketPago } from '../utils/printTicket'

export default function PagosPage() {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [soloHoy, setSoloHoy] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailOrden, setDetailOrden] = useState(null)
  const [detailPago, setDetailPago] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const fetchData = async () => {
    try {
      const { data } = await getPagos(0, 500)
      setPagos(data)
    } catch {
      toast.error('Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const isToday = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  }

  const filtered = useMemo(() => soloHoy ? pagos.filter(p => isToday(p.creado_en)) : pagos, [pagos, soloHoy])

  const totalDia = useMemo(() => filtered.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0), [filtered])

  const money = (val) => '$' + parseFloat(val || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })

  const openDetail = async (pago) => {
    setDetailPago(pago)
    setDetailOrden(null)
    setDetailOpen(true)
    setLoadingDetail(true)
    try {
      const { data } = await getOrden(pago.orden_id)
      setDetailOrden(data)
    } catch {
      toast.error('Error al cargar detalle de la orden')
    } finally {
      setLoadingDetail(false)
    }
  }

  const reprint = async (pago) => {
    try {
      const { data: ord } = await getOrden(pago.orden_id)
      printTicketPago(ord, { metodo_pago: pago.metodo_pago, monto: parseFloat(pago.monto) })
    } catch { toast.error('Error al reimprimir ticket') }
  }

  if (loading) return <LoadingSpinner className="mt-32" size="lg" />

  return (
    <div>
      <PageHeader title="Ventas" subtitle={`${filtered.length} ventas — Total: ${money(totalDia)}`}>
        <button
          onClick={() => setSoloHoy(!soloHoy)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${soloHoy ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {soloHoy ? 'Hoy' : 'Todas'}
        </button>
      </PageHeader>

      {/* Vista móvil: Cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((pago) => (
          <div key={pago.id} onClick={() => openDetail(pago)} className="cursor-pointer rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 active:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Orden <b className="text-gray-900">#{pago.orden_id}</b></span>
              <span className="text-lg font-bold text-green-700">{money(pago.monto)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="capitalize">{pago.metodo_pago}</span>
              <span>{new Date(pago.creado_en).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {pago.referencia && <p className="text-xs text-gray-400 mt-1">Ref: {pago.referencia}</p>}
            <div className="mt-2 border-t border-gray-100 pt-2 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); reprint(pago) }}
                className="flex-1 rounded-lg bg-gray-50 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                🖨️ Reimprimir
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
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((pago) => (
              <tr key={pago.id} onClick={() => openDetail(pago)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{pago.id}</td>
                <td className="px-4 py-3 text-sm text-gray-500">#{pago.orden_id}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-green-700">{money(pago.monto)}</td>
                <td className="px-4 py-3 text-sm text-gray-500 capitalize">{pago.metodo_pago}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{pago.referencia || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(pago.creado_en).toLocaleString('es-MX')}</td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openDetail(pago) }} className="rounded-md p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="Ver detalle">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); reprint(pago) }} className="rounded-md p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="Reimprimir ticket">
                      <PrinterIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal detalle de venta */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Detalle — Orden #${detailPago?.orden_id || ''}`}>
        {detailPago && (
          <div className="space-y-4">
            {/* Info del pago */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Método de pago</p>
                <p className="font-medium capitalize">{detailPago.metodo_pago}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Monto</p>
                <p className="font-semibold text-green-700">{money(detailPago.monto)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Fecha</p>
                <p className="font-medium">{new Date(detailPago.creado_en).toLocaleString('es-MX')}</p>
              </div>
              {detailPago.referencia && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Referencia</p>
                  <p className="font-medium">{detailPago.referencia}</p>
                </div>
              )}
            </div>

            {/* Productos de la orden */}
            {loadingDetail ? (
              <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
            ) : detailOrden ? (
              <div className="rounded-lg border border-gray-200">
                <div className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase text-gray-500 rounded-t-lg">Productos</div>
                <div className="divide-y divide-gray-100">
                  {(detailOrden.detalles || []).map((d, i) => (
                    <div key={i} className="flex items-start justify-between px-4 py-2.5 text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{d.cantidad}x {d.producto?.nombre || `Producto #${d.producto_id}`}</p>
                        {d.notas && <p className="text-xs text-gray-500 mt-0.5">{d.notas}</p>}
                      </div>
                      <span className="font-medium text-gray-700 ml-3">{money(d.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 flex justify-between px-4 py-3 font-bold text-sm">
                  <span>Total</span>
                  <span className="text-green-700">{money(detailOrden.total)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No se pudo cargar el detalle de la orden.</p>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => reprint(detailPago)} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                <PrinterIcon className="h-4 w-4" /> Reimprimir
              </button>
              <button onClick={() => setDetailOpen(false)} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
