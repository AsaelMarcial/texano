import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon } from '@heroicons/react/24/outline'
import { getCortesCaja, createCorteCaja, closeCorteCaja } from '../services/endpoints'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function CorteCajaPage() {
  const [cortes, setCortes] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [closingCorte, setClosingCorte] = useState(null)
  const [fondoInicial, setFondoInicial] = useState('')
  const [closeForm, setCloseForm] = useState({ total_real: '', notas: '' })

  const fetchData = async () => {
    try {
      const { data } = await getCortesCaja(0, 200)
      setCortes(data)
    } catch {
      toast.error('Error al cargar cortes de caja')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createCorteCaja({ fondo_inicial: parseFloat(fondoInicial) })
      toast.success('Corte de caja abierto')
      setCreateModalOpen(false)
      setFondoInicial('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al abrir corte')
    }
  }

  const openClose = (corte) => {
    setClosingCorte(corte)
    setCloseForm({ total_real: '', notas: '' })
    setCloseModalOpen(true)
  }

  const handleClose = async (e) => {
    e.preventDefault()
    try {
      await closeCorteCaja(closingCorte.id, {
        total_real: parseFloat(closeForm.total_real),
        notas: closeForm.notas || null,
      })
      toast.success('Corte de caja cerrado')
      setCloseModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al cerrar corte')
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

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Inicio</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fin</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Fondo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Ventas</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Esperado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Real</th>
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
                <td className="px-4 py-3 text-sm text-right text-gray-500">${parseFloat(corte.fondo_inicial).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">${parseFloat(corte.total_ventas).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-500">${parseFloat(corte.total_esperado).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-500">{corte.total_real != null ? `$${parseFloat(corte.total_real).toFixed(2)}` : '—'}</td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${corte.diferencia != null ? (parseFloat(corte.diferencia) >= 0 ? 'text-green-700' : 'text-red-600') : 'text-gray-400'}`}>
                  {corte.diferencia != null ? `$${parseFloat(corte.diferencia).toFixed(2)}` : '—'}
                </td>
                <td className="px-4 py-3 text-center"><StatusBadge status={corte.estado} /></td>
                <td className="px-4 py-3 text-center">
                  {corte.estado === 'abierto' && (
                    <button onClick={() => openClose(corte)} className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors">
                      Cerrar corte
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
            <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">Abrir corte</button>
          </div>
        </form>
      </Modal>

      {/* Modal cerrar corte */}
      <Modal open={closeModalOpen} onClose={() => setCloseModalOpen(false)} title="Cerrar corte de caja">
        <form onSubmit={handleClose} className="space-y-4">
          {closingCorte && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
              <p>Total ventas: <span className="font-semibold">${parseFloat(closingCorte.total_ventas).toFixed(2)}</span></p>
              <p>Efectivo: <span className="font-semibold">${parseFloat(closingCorte.total_efectivo).toFixed(2)}</span></p>
              <p>Tarjeta: <span className="font-semibold">${parseFloat(closingCorte.total_tarjeta).toFixed(2)}</span></p>
              <p>Transferencia: <span className="font-semibold">${parseFloat(closingCorte.total_transferencia).toFixed(2)}</span></p>
              <p className="pt-1 border-t border-gray-200">Total esperado: <span className="font-bold text-primary-700">${parseFloat(closingCorte.total_esperado).toFixed(2)}</span></p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total real en caja ($)</label>
            <input type="number" step="0.01" required value={closeForm.total_real} onChange={(e) => setCloseForm({ ...closeForm, total_real: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={closeForm.notas} onChange={(e) => setCloseForm({ ...closeForm, notas: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" placeholder="Observaciones del corte" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCloseModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Cerrar corte</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

