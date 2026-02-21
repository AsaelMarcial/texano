import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { getPagos, createPago, getOrdenes, getOrden } from '../services/endpoints'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { printTicketPago } from '../utils/printTicket'

export default function PagosPage() {
  const [pagos, setPagos] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    orden_id: '', monto: '', metodo_pago: 'efectivo', referencia: '', monto_recibido: '',
  })

  const fetchData = async () => {
    try {
      const [pagosRes, ordenesRes] = await Promise.all([getPagos(0, 500), getOrdenes(0, 500)])
      setPagos(pagosRes.data)
      setOrdenes(ordenesRes.data)
    } catch {
      toast.error('Error al cargar pagos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setForm({ orden_id: '', monto: '', metodo_pago: 'efectivo', referencia: '', monto_recibido: '' })
    setModalOpen(true)
  }

  const handleOrdenSelect = (ordenId) => {
    const orden = ordenes.find((o) => o.id === parseInt(ordenId))
    const total = orden ? parseFloat(orden.total).toFixed(2) : ''
    setForm((prev) => ({
      ...prev,
      orden_id: ordenId,
      monto: total,
      monto_recibido: '',
    }))
  }

  const handleMetodoChange = (metodo) => {
    setForm((prev) => ({
      ...prev,
      metodo_pago: metodo,
      monto_recibido: metodo !== 'efectivo' ? '' : prev.monto_recibido,
      referencia: '',
    }))
  }

  const cambio = form.metodo_pago === 'efectivo' && form.monto_recibido && form.monto
    ? Math.max(0, parseFloat(form.monto_recibido) - parseFloat(form.monto))
    : 0

  const canSubmit = () => {
    if (!form.orden_id || !form.monto) return false
    if (form.metodo_pago === 'efectivo') {
      return form.monto_recibido && parseFloat(form.monto_recibido) >= parseFloat(form.monto)
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.metodo_pago === 'efectivo' && parseFloat(form.monto_recibido) < parseFloat(form.monto)) {
      toast.error('El monto recibido debe ser mayor o igual al total')
      return
    }
    setSaving(true)
    try {
      await createPago({
        orden_id: parseInt(form.orden_id),
        monto: parseFloat(form.monto),
        metodo_pago: form.metodo_pago,
        referencia: form.referencia || null,
      })
      toast.success('Pago registrado correctamente')

      // Imprimir ticket de pago
      try {
        const { data: ordenCompleta } = await getOrden(parseInt(form.orden_id))
        printTicketPago(ordenCompleta, {
          metodo_pago: form.metodo_pago,
          monto: parseFloat(form.monto),
          monto_recibido: form.metodo_pago === 'efectivo' ? parseFloat(form.monto_recibido) : null,
          cambio: form.metodo_pago === 'efectivo' ? cambio : 0,
        })
      } catch {
        // Si falla la impresión, no bloquear
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al registrar pago')
    } finally {
      setSaving(false)
    }
  }

  // Órdenes que se pueden pagar: abierta (flujo simplificado)
  const ordenesPorPagar = ordenes.filter((o) => o.estado === 'abierta' || o.estado === 'pendiente' || o.estado === 'entregada' || o.estado === 'lista')

  if (loading) return <LoadingSpinner className="mt-32" size="lg" />

  return (
    <div>
      <PageHeader title="Pagos" subtitle={`${pagos.length} pagos registrados`}>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-4 w-4" /> Nuevo pago
        </button>
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

      {/* Modal registrar pago */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar pago">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <select required value={form.orden_id} onChange={(e) => handleOrdenSelect(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none">
              <option value="">Seleccionar orden</option>
              {ordenesPorPagar.map((o) => (
                <option key={o.id} value={o.id}>#{o.numero_orden} — Mesa {o.mesa_id || 'S/M'} — ${parseFloat(o.total).toFixed(2)}</option>
              ))}
            </select>
          </div>

          {/* Total a cobrar */}
          {form.monto && (
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-sm text-gray-500">Total a cobrar</p>
              <p className="text-3xl font-bold text-gray-900">${parseFloat(form.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
          )}

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'efectivo', label: '💵 Efectivo' },
                { value: 'tarjeta', label: '💳 Tarjeta' },
                { value: 'transferencia', label: '🏦 Transferencia' },
              ].map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleMetodoChange(m.value)}
                  className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    form.metodo_pago === m.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campos condicionales según método */}
          {form.metodo_pago === 'efectivo' && form.monto && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto recibido del cliente</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.monto_recibido}
                  onChange={(e) => setForm({ ...form, monto_recibido: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              {form.monto_recibido && (
                <div className={`rounded-lg p-3 text-center ${cambio >= 0 && parseFloat(form.monto_recibido) >= parseFloat(form.monto) ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-gray-600">Cambio a devolver</p>
                  <p className={`text-2xl font-bold ${cambio >= 0 && parseFloat(form.monto_recibido) >= parseFloat(form.monto) ? 'text-green-700' : 'text-red-600'}`}>
                    ${cambio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  {parseFloat(form.monto_recibido) < parseFloat(form.monto) && (
                    <p className="text-xs text-red-500 mt-1">Monto insuficiente</p>
                  )}
                </div>
              )}
            </>
          )}

          {(form.metodo_pago === 'tarjeta' || form.metodo_pago === 'transferencia') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.metodo_pago === 'tarjeta' ? 'Últimos 4 dígitos (opcional)' : 'Referencia de transferencia (opcional)'}
              </label>
              <input
                type="text"
                value={form.referencia}
                onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder={form.metodo_pago === 'tarjeta' ? '1234' : 'REF-001'}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button
              type="submit"
              disabled={saving || !canSubmit()}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Procesando…' : '✓ Cobrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

