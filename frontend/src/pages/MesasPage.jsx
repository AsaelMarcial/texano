import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { getMesas, createMesa, updateMesa, deleteMesa } from '../services/endpoints'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const defaultForm = { numero: '', capacidad: 4, estado: 'disponible', ubicacion: '', activo: true }

export default function MesasPage() {
  const [mesas, setMesas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState(defaultForm)

  const fetchMesas = async () => {
    try {
      const { data } = await getMesas(0, 200)
      setMesas(data)
    } catch {
      toast.error('Error al cargar mesas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMesas() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (mesa) => {
    setEditing(mesa)
    setForm({
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      estado: mesa.estado,
      ubicacion: mesa.ubicacion || '',
      activo: mesa.activo,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, numero: parseInt(form.numero), capacidad: parseInt(form.capacidad) }
      if (editing) {
        await updateMesa(editing.id, payload)
        toast.success('Mesa actualizada')
      } else {
        await createMesa(payload)
        toast.success('Mesa creada')
      }
      setModalOpen(false)
      fetchMesas()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar mesa')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMesa(deleting.id)
      toast.success('Mesa eliminada')
      fetchMesas()
    } catch {
      toast.error('Error al eliminar mesa')
    }
  }

  if (loading) return <LoadingSpinner className="mt-32" size="lg" />

  return (
    <div>
      <PageHeader title="Mesas" subtitle={`${mesas.length} mesas registradas`}>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Nueva mesa
        </button>
      </PageHeader>

      {/* Grid de mesas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            className="relative rounded-xl bg-white p-3 sm:p-4 shadow-sm ring-1 ring-gray-200 hover:shadow-md active:shadow-md transition-shadow"
          >
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{mesa.numero}</p>
              <p className="mt-1 text-xs text-gray-500">Cap. {mesa.capacidad}</p>
              <div className="mt-2">
                <StatusBadge status={mesa.estado} />
              </div>
              {mesa.ubicacion && (
                <p className="mt-1 text-xs text-gray-400">{mesa.ubicacion}</p>
              )}
            </div>
            <div className="mt-3 flex justify-center gap-3 sm:gap-2">
              <button
                onClick={() => openEdit(mesa)}
                className="rounded-md p-2 sm:p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600 active:bg-primary-100 transition-colors"
              >
                <PencilSquareIcon className="h-5 w-5 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => { setDeleting(mesa); setConfirmOpen(true) }}
                className="rounded-md p-2 sm:p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 active:bg-red-100 transition-colors"
              >
                <TrashIcon className="h-5 w-5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal crear/editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar mesa' : 'Nueva mesa'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                type="number"
                required
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
              <input
                type="number"
                required
                value={form.capacidad}
                onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              placeholder="Terraza, Interior, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="reservada">Reservada</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mesa-activo"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            <label htmlFor="mesa-activo" className="text-sm text-gray-700">Activa</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              {editing ? 'Guardar cambios' : 'Crear mesa'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar mesa"
        message={`¿Estás seguro de eliminar la mesa ${deleting?.numero}?`}
      />
    </div>
  )
}

