import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, EyeIcon, TrashIcon, PrinterIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { getOrdenes, createOrden, updateOrden, deleteOrden, getMesas, getProductos, getCategorias, getOrden } from '../services/endpoints'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { printTicketOrden } from '../utils/printTicket'

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([])
  const [mesas, setMesas] = useState([])
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedOrden, setSelectedOrden] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('')

  // Form para nueva orden
  const [form, setForm] = useState({ mesa_id: '', tipo: 'en_sitio', notas: '', detalles: [] })
  const [catSeleccionada, setCatSeleccionada] = useState('')

  const fetchData = async () => {
    try {
      const [ordRes, mesRes, prodRes, catRes] = await Promise.all([
        getOrdenes(0, 500, filtroEstado || null),
        getMesas(0, 200),
        getProductos(0, 500),
        getCategorias(0, 200),
      ])
      setOrdenes(ordRes.data)
      setMesas(mesRes.data)
      setProductos(prodRes.data)
      setCategorias(catRes.data)
    } catch {
      toast.error('Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [filtroEstado])

  const openCreate = () => {
    setForm({ mesa_id: '', tipo: 'en_sitio', notas: '', detalles: [] })
    setCatSeleccionada('')
    setModalOpen(true)
  }

  const addItem = (producto) => {
    setForm((prev) => {
      const existing = prev.detalles.find((d) => d.producto_id === producto.id)
      if (existing) {
        return {
          ...prev,
          detalles: prev.detalles.map((d) =>
            d.producto_id === producto.id ? { ...d, cantidad: d.cantidad + 1 } : d
          ),
        }
      }
      return {
        ...prev,
        detalles: [...prev.detalles, { producto_id: producto.id, cantidad: 1, notas: '', _nombre: producto.nombre, _precio: producto.precio }],
      }
    })
  }

  const removeItem = (productoId) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((d) => d.producto_id !== productoId),
    }))
  }

  const updateItemQty = (productoId, qty) => {
    if (qty < 1) return removeItem(productoId)
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((d) =>
        d.producto_id === productoId ? { ...d, cantidad: qty } : d
      ),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.detalles.length === 0) { toast.error('Agrega al menos un producto'); return }
    setSaving(true)
    try {
      const payload = {
        mesa_id: form.mesa_id ? parseInt(form.mesa_id) : null,
        tipo: form.tipo,
        notas: form.notas || null,
        detalles: form.detalles.map((d) => ({ producto_id: d.producto_id, cantidad: d.cantidad, notas: d.notas || null })),
      }
      const { data: nuevaOrden } = await createOrden(payload)
      toast.success(`Orden ${nuevaOrden.numero_orden} creada`)

      // Imprimir ticket de cocina automáticamente
      try {
        printTicketOrden(nuevaOrden)
      } catch {
        // No bloquear si falla la impresión
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al crear orden')
    } finally {
      setSaving(false)
    }
  }

  const cancelarOrden = async (orden) => {
    try {
      await updateOrden(orden.id, { estado: 'cancelada' })
      toast.success(`Orden #${orden.numero_orden} cancelada`)
      fetchData()
    } catch {
      toast.error('Error al cancelar orden')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteOrden(deleting.id)
      toast.success('Orden eliminada')
      fetchData()
    } catch {
      toast.error('Error al eliminar orden')
    }
  }

  const reimprimirTicket = async (ordenId) => {
    try {
      const { data: ord } = await getOrden(ordenId)
      printTicketOrden(ord)
    } catch {
      toast.error('Error al reimprimir ticket')
    }
  }

  const total = form.detalles.reduce((sum, d) => sum + parseFloat(d._precio || 0) * d.cantidad, 0)

  const prodsFiltrados = catSeleccionada
    ? productos.filter((p) => p.categoria_id === parseInt(catSeleccionada) && p.disponible)
    : productos.filter((p) => p.disponible)

  if (loading) return <LoadingSpinner className="mt-32" size="lg" />

  return (
    <div>
      <PageHeader title="Órdenes" subtitle={`${ordenes.length} órdenes`}>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none">
          <option value="">Todos los estados</option>
          <option value="abierta">Abierta</option>
          <option value="pagada">Pagada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-4 w-4" /> Nueva orden
        </button>
      </PageHeader>

      {/* Vista móvil: Cards */}
      <div className="space-y-3 md:hidden">
        {ordenes.map((orden) => (
          <div key={orden.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-gray-900">{orden.numero_orden}</span>
              <StatusBadge status={orden.estado} />
            </div>
            <div className="grid grid-cols-2 gap-1 text-sm text-gray-500 mb-3">
              <span>Mesa: <b className="text-gray-700">{orden.mesa_id || '—'}</b></span>
              <span className="text-right capitalize">{orden.tipo?.replace('_', ' ')}</span>
              <span>{new Date(orden.creado_en).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-right text-base font-bold text-gray-900">${parseFloat(orden.total).toFixed(2)}</span>
            </div>
            <div className="flex gap-2 border-t border-gray-100 pt-2">
              <button onClick={() => { setSelectedOrden(orden); setDetailOpen(true) }} className="flex-1 rounded-lg bg-gray-50 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200">
                Ver detalle
              </button>
              <button onClick={() => reimprimirTicket(orden.id)} className="flex-1 rounded-lg bg-gray-50 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200">
                🖨️ Ticket
              </button>
              {orden.estado === 'abierta' && (
                <button onClick={() => cancelarOrden(orden)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 active:bg-red-200">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Vista desktop: Tabla */}
      <div className="hidden md:block overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500"># Orden</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Mesa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ordenes.map((orden) => (
              <tr key={orden.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{orden.numero_orden}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{orden.mesa_id || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 capitalize">{orden.tipo?.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">${parseFloat(orden.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-center"><StatusBadge status={orden.estado} /></td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(orden.creado_en).toLocaleString('es-MX')}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => { setSelectedOrden(orden); setDetailOpen(true) }} className="rounded-md p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="Ver detalle">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => reimprimirTicket(orden.id)} className="rounded-md p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="Reimprimir ticket">
                      <PrinterIcon className="h-4 w-4" />
                    </button>
                    {orden.estado === 'abierta' && (
                      <button onClick={() => cancelarOrden(orden)} className="rounded-md px-2 py-1 text-xs bg-red-50 text-red-700 hover:bg-red-100" title="Cancelar orden">
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => { setDeleting(orden); setConfirmOpen(true) }} className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Eliminar">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal nueva orden */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva orden" maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Izquierda: selección de productos */}
            <div>
              <div className="mb-3 flex gap-2">
                <select value={catSeleccionada} onChange={(e) => setCatSeleccionada(e.target.value)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none">
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 sm:max-h-64 overflow-y-auto pr-1">
                {prodsFiltrados.map((prod) => (
                  <button key={prod.id} type="button" onClick={() => addItem(prod)} className="rounded-lg border border-gray-200 p-3 sm:p-2 text-left hover:border-primary-400 hover:bg-primary-50 active:bg-primary-100 transition-colors">
                    <p className="text-sm font-medium text-gray-900 truncate">{prod.nombre}</p>
                    <p className="text-xs text-texano-500 font-semibold">${parseFloat(prod.precio).toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Derecha: resumen */}
            <div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mesa</label>
                  <select value={form.mesa_id} onChange={(e) => setForm({ ...form, mesa_id: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none">
                    <option value="">Sin mesa</option>
                    {mesas.filter((m) => m.estado === 'disponible' || m.estado === 'ocupada').map((m) => <option key={m.id} value={m.id}>Mesa {m.numero}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none">
                    <option value="en_sitio">En sitio</option>
                    <option value="para_llevar">Para llevar</option>
                    <option value="domicilio">Domicilio</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <input type="text" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" placeholder="Indicaciones especiales" />
              </div>

              {/* Items */}
              <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-44 overflow-y-auto">
                {form.detalles.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-400">Selecciona productos del menú</p>
                ) : (
                  form.detalles.map((d) => (
                    <div key={d.producto_id} className="flex items-center justify-between p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{d._nombre}</p>
                        <p className="text-xs text-gray-500">${parseFloat(d._precio).toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateItemQty(d.producto_id, d.cantidad - 1)} className="rounded-md bg-gray-100 px-2 py-0.5 text-sm hover:bg-gray-200">−</button>
                        <span className="w-6 text-center text-sm font-medium">{d.cantidad}</span>
                        <button type="button" onClick={() => updateItemQty(d.producto_id, d.cantidad + 1)} className="rounded-md bg-gray-100 px-2 py-0.5 text-sm hover:bg-gray-200">+</button>
                        <button type="button" onClick={() => removeItem(d.producto_id)} className="ml-1 text-red-400 hover:text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm font-medium text-gray-700">Total estimado</span>
                <span className="text-xl font-bold text-texano-500">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
                  {saving ? 'Creando…' : '🖨️ Crear y enviar a cocina'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal detalle orden */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Orden #${selectedOrden?.numero_orden || ''}`}>
        {selectedOrden && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Mesa:</span> <span className="font-medium">{selectedOrden.mesa_id || 'N/A'}</span></div>
              <div><span className="text-gray-500">Tipo:</span> <span className="font-medium capitalize">{selectedOrden.tipo?.replace('_', ' ')}</span></div>
              <div><span className="text-gray-500">Estado:</span> <StatusBadge status={selectedOrden.estado} /></div>
              <div><span className="text-gray-500">Fecha:</span> <span className="font-medium">{new Date(selectedOrden.creado_en).toLocaleString('es-MX')}</span></div>
            </div>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              {selectedOrden.detalles?.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.producto_nombre || `Producto #${d.producto_id}`}</p>
                    {d.notas && <p className="text-xs text-gray-500">→ {d.notas}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{d.cantidad} × ${parseFloat(d.precio_unitario).toFixed(2)}</p>
                    <p className="text-sm font-semibold text-texano-500">${parseFloat(d.subtotal).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between rounded-lg bg-gray-50 p-3">
              <div className="text-sm space-y-1">
                <p className="text-gray-500">Subtotal: <span className="font-medium text-gray-900">${parseFloat(selectedOrden.subtotal).toFixed(2)}</span></p>
                <p className="text-gray-500">IVA 16%: <span className="font-medium text-gray-900">${parseFloat(selectedOrden.impuesto).toFixed(2)}</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-texano-500">${parseFloat(selectedOrden.total).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => reimprimirTicket(selectedOrden.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <PrinterIcon className="h-4 w-4" /> Reimprimir ticket
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Eliminar orden" message={`¿Eliminar la orden #${deleting?.numero_orden}? Esta acción no se puede deshacer.`} />
    </div>
  )
}

