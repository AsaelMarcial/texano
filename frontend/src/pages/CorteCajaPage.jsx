import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, EyeIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { getCortesCaja, getCorteCaja, createCorteCaja, closeCorteCaja, getVentasActuales, getPagosCorte } from '../services/endpoints'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function CorteCajaPage() {
  const [cortes, setCortes] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [closingCorte, setClosingCorte] = useState(null)
  const [detailCorte, setDetailCorte] = useState(null)
  const [fondoInicial, setFondoInicial] = useState('')
  const [closeForm, setCloseForm] = useState({ total_real: '', notas: '' })
  const [saving, setSaving] = useState(false)
  const [ventasActuales, setVentasActuales] = useState(null)
  const [detailPagos, setDetailPagos] = useState([])
  const [showPagos, setShowPagos] = useState(false)
  const [loadingPagos, setLoadingPagos] = useState(false)
  const [closeVentas, setCloseVentas] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const { data } = await getCortesCaja(0, 200)
      setCortes(data)
      // Cargar ventas actuales si hay corte abierto
      try {
        const { data: ventas } = await getVentasActuales()
        setVentasActuales(ventas)
      } catch { setVentasActuales(null) }
    } catch {
      toast.error('Error al cargar cortes de caja')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh ventas cada 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data: ventas } = await getVentasActuales()
        setVentasActuales(ventas)
      } catch { /* ignore */ }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const money = (val) => '$' + parseFloat(val || 0).toFixed(2)

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createCorteCaja({ fondo_inicial: parseFloat(fondoInicial) })
      toast.success('Corte de caja abierto')
      setCreateModalOpen(false)
      setFondoInicial('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al abrir corte')
    } finally {
      setSaving(false)
    }
  }

  const openClose = async (corte) => {
    setClosingCorte(corte)
    setCloseForm({ total_real: '', notas: '' })
    setCloseVentas(null)
    setCloseModalOpen(true)
    // Pre-cargar ventas actuales para mostrar resumen antes de cerrar
    try {
      const { data: ventas } = await getVentasActuales()
      setCloseVentas(ventas)
    } catch { /* ignore */ }
  }

  const handleClose = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: corteCerrado } = await closeCorteCaja(closingCorte.id, {
        total_real: parseFloat(closeForm.total_real),
        notas: closeForm.notas || null,
      })
      toast.success('Corte de caja cerrado')
      setCloseModalOpen(false)
      // Mostrar resumen del corte cerrado
      setDetailCorte(corteCerrado)
      setDetailModalOpen(true)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al cerrar corte')
    } finally {
      setSaving(false)
    }
  }

  const openDetail = async (corte) => {
    try {
      const { data } = await getCorteCaja(corte.id)
      setDetailCorte(data)
      setDetailPagos([])
      setShowPagos(false)
      setDetailModalOpen(true)
    } catch {
      toast.error('Error al cargar detalle del corte')
    }
  }

  const loadPagosDetail = async (corteId) => {
    setLoadingPagos(true)
    try {
      const { data } = await getPagosCorte(corteId)
      setDetailPagos(data)
      setShowPagos(true)
    } catch {
      toast.error('Error al cargar pagos del corte')
    } finally {
      setLoadingPagos(false)
    }
  }

  if (loading) return <LoadingSpinner className="mt-32" size="lg" />

  return (
    <div>
      <PageHeader title="Corte de Caja" subtitle={`${cortes.length} cortes`}>
        <button onClick={() => setCreateModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-4 w-4" /> Abrir corte
        </button>
      </PageHeader>

      {/* Banner de ventas en vivo si hay corte abierto */}
      {ventasActuales?.corte_abierto && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 ring-1 ring-green-200">
          <div className="flex items-center gap-2 mb-3">
            <BanknotesIcon className="h-5 w-5 text-green-700" />
            <h3 className="text-sm font-semibold text-green-800">Ventas del corte actual</h3>
            <span className="ml-auto text-xs text-green-600">{ventasActuales.num_pagos} ventas</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-white/70 p-2.5">
              <p className="text-xs text-gray-500">Efectivo</p>
              <p className="text-base font-bold text-gray-900">{money(ventasActuales.total_efectivo)}</p>
            </div>
            <div className="rounded-lg bg-white/70 p-2.5">
              <p className="text-xs text-gray-500">Tarjeta</p>
              <p className="text-base font-bold text-gray-900">{money(ventasActuales.total_tarjeta)}</p>
            </div>
            <div className="rounded-lg bg-white/70 p-2.5">
              <p className="text-xs text-gray-500">Transferencia</p>
              <p className="text-base font-bold text-gray-900">{money(ventasActuales.total_transferencia)}</p>
            </div>
            <div className="rounded-lg bg-green-100/80 p-2.5">
              <p className="text-xs text-green-700">Total</p>
              <p className="text-base font-bold text-green-700">{money(ventasActuales.total_ventas)}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-green-600">Esperado en caja: <b>{money(ventasActuales.total_esperado)}</b> (fondo {money(ventasActuales.fondo_inicial)} + efectivo)</p>
        </div>
      )}

      {/* Vista móvil: Cards */}
      <div className="space-y-3 md:hidden">
        {cortes.map((corte) => (
          <div key={corte.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Corte #{corte.id}</span>
              <StatusBadge status={corte.estado} />
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Inicio: {new Date(corte.fecha_inicio).toLocaleString('es-MX')}</p>
              {corte.fecha_fin && <p>Fin: {new Date(corte.fecha_fin).toLocaleString('es-MX')}</p>}
              <p>Fondo: <b>{money(corte.fondo_inicial)}</b></p>
              {corte.estado === 'cerrado' && (
                <>
                  <p>Ventas: <b className="text-green-700">{money(corte.total_ventas)}</b></p>
                  <p className={`font-semibold ${parseFloat(corte.diferencia) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    Diferencia: {money(corte.diferencia)}
                  </p>
                </>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              {corte.estado === 'abierto' ? (
                <button onClick={() => openClose(corte)} className="flex-1 rounded-lg bg-red-50 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">
                  Cerrar corte
                </button>
              ) : (
                <button onClick={() => openDetail(corte)} className="flex-1 rounded-lg bg-gray-50 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                  Ver detalle
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Inicio</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fin</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Fondo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Ventas</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Diferencia</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cortes.map((corte) => (
              <tr key={corte.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{corte.id}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(corte.fecha_inicio).toLocaleString('es-MX')}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{corte.fecha_fin ? new Date(corte.fecha_fin).toLocaleString('es-MX') : '—'}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-500">{money(corte.fondo_inicial)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{money(corte.total_ventas)}</td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${corte.diferencia != null ? (parseFloat(corte.diferencia) >= 0 ? 'text-green-700' : 'text-red-600') : 'text-gray-400'}`}>
                  {corte.diferencia != null ? money(corte.diferencia) : '—'}
                </td>
                <td className="px-4 py-3 text-center"><StatusBadge status={corte.estado} /></td>
                <td className="px-4 py-3 text-center">
                  {corte.estado === 'abierto' ? (
                    <button onClick={() => openClose(corte)} className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors">
                      Cerrar corte
                    </button>
                  ) : (
                    <button onClick={() => openDetail(corte)} className="rounded-md p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600" title="Ver detalle">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal abrir corte */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Abrir corte de caja">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fondo inicial ($)</label>
            <input type="number" step="0.01" required value={fondoInicial} onChange={(e) => setFondoInicial(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" placeholder="500.00" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
              {saving ? 'Abriendo...' : 'Abrir corte'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal cerrar corte */}
      <Modal open={closeModalOpen} onClose={() => setCloseModalOpen(false)} title="Cerrar corte de caja">
        <form onSubmit={handleClose} className="space-y-4">
          {closingCorte && (
            <div className="space-y-3">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                <p className="font-medium">Corte #{closingCorte.id}</p>
                <p className="text-xs mt-1">Abierto: {new Date(closingCorte.fecha_inicio).toLocaleString('es-MX')}</p>
                <p className="text-xs">Fondo inicial: <b>{money(closingCorte.fondo_inicial)}</b></p>
              </div>
              {closeVentas && (
                <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 text-sm">
                  <div className="bg-gray-50 px-3 py-2 text-xs font-semibold uppercase text-gray-500">Resumen de ventas</div>
                  <div className="flex justify-between px-3 py-2"><span className="text-gray-600">Efectivo</span><span className="font-medium">{money(closeVentas.total_efectivo)}</span></div>
                  <div className="flex justify-between px-3 py-2"><span className="text-gray-600">Tarjeta</span><span className="font-medium">{money(closeVentas.total_tarjeta)}</span></div>
                  <div className="flex justify-between px-3 py-2"><span className="text-gray-600">Transferencia</span><span className="font-medium">{money(closeVentas.total_transferencia)}</span></div>
                  <div className="flex justify-between px-3 py-2 bg-green-50 font-semibold"><span>Total ventas</span><span className="text-green-700">{money(closeVentas.total_ventas)}</span></div>
                  <div className="flex justify-between px-3 py-2 bg-blue-50 font-semibold"><span>Esperado en caja</span><span className="text-blue-700">{money(closeVentas.total_esperado)}</span></div>
                  <div className="px-3 py-2 text-xs text-gray-500">{closeVentas.num_pagos} ventas registradas</div>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total real en caja ($)</label>
            <input type="number" step="0.01" required value={closeForm.total_real} onChange={(e) => setCloseForm({ ...closeForm, total_real: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" placeholder="Cuenta el efectivo en caja" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea value={closeForm.notas} onChange={(e) => setCloseForm({ ...closeForm, notas: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" placeholder="Observaciones del corte" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCloseModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {saving ? 'Cerrando...' : 'Cerrar corte'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal detalle de corte cerrado */}
      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Resumen — Corte #${detailCorte?.id || ''}`}>
        {detailCorte && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Inicio</p>
                <p className="font-medium">{new Date(detailCorte.fecha_inicio).toLocaleString('es-MX')}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Fin</p>
                <p className="font-medium">{detailCorte.fecha_fin ? new Date(detailCorte.fecha_fin).toLocaleString('es-MX') : '—'}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 text-sm">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-600">Fondo inicial</span>
                <span className="font-medium">{money(detailCorte.fondo_inicial)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-600">Ventas en efectivo</span>
                <span className="font-medium">{money(detailCorte.total_efectivo)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-600">Ventas en tarjeta</span>
                <span className="font-medium">{money(detailCorte.total_tarjeta)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-600">Ventas en transferencia</span>
                <span className="font-medium">{money(detailCorte.total_transferencia)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 bg-gray-50 font-semibold">
                <span>Total ventas</span>
                <span className="text-green-700">{money(detailCorte.total_ventas)}</span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 text-sm">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-600">Esperado en caja (fondo + efectivo)</span>
                <span className="font-medium">{money(detailCorte.total_esperado)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-600">Real en caja</span>
                <span className="font-medium">{money(detailCorte.total_real)}</span>
              </div>
              <div className={`flex justify-between px-4 py-2.5 font-bold text-base ${parseFloat(detailCorte.diferencia) >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                <span>Diferencia</span>
                <span>{money(detailCorte.diferencia)}</span>
              </div>
            </div>

            {detailCorte.notas && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <p className="text-xs text-gray-500 mb-1">Notas</p>
                <p className="text-gray-700">{detailCorte.notas}</p>
              </div>
            )}

            {/* Sección de pagos del corte */}
            {!showPagos ? (
              <button
                onClick={() => loadPagosDetail(detailCorte.id)}
                disabled={loadingPagos}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {loadingPagos ? 'Cargando...' : `Ver pagos del corte`}
              </button>
            ) : (
              <div className="rounded-lg border border-gray-200">
                <div className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase text-gray-500 rounded-t-lg">
                  Pagos ({detailPagos.length})
                </div>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {detailPagos.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">#{p.orden_id}</span>
                        <span className="ml-2 text-gray-500 capitalize">{p.metodo_pago}</span>
                        {p.referencia && <span className="ml-2 text-xs text-gray-400">Ref: {p.referencia}</span>}
                      </div>
                      <span className="font-semibold text-green-700">{money(p.monto)}</span>
                    </div>
                  ))}
                  {detailPagos.length === 0 && (
                    <p className="px-4 py-3 text-sm text-gray-400 text-center">Sin pagos registrados</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setDetailModalOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

