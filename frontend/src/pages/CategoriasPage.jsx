import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/endpoints'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const defaultForm = { nombre: '', descripcion: '', imagen_url: '', orden: 0, activo: true }

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState(defaultForm)

  const fetchData = async () => {
    try {
      const { data } = await getCategorias(0, 200)
      setCategorias(data)
    } catch {
      toast.error('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModalOpen(true) }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion || '', imagen_url: cat.imagen_url || '', orden: cat.orden, activo: cat.activo })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, orden: parseInt(form.orden) }
      if (editing) {
        await updateCategoria(editing.id, payload)
        toast.success('Categoría actualizada')
      } else {
        await createCategoria(payload)
        toast.success('Categoría creada')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar categoría')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCategoria(deleting.id)
      toast.success('Categoría eliminada')
      fetchData()
    } catch {
      toast.error('Error al eliminar categoría')
    }
  }

  if (loading) return <LoadingSpinner className="mt-32" size="lg" />

  return (
    <div>
      <PageHeader title="Categorías" subtitle={`${categorias.length} categorías`}>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-4 w-4" /> Nueva categoría
        </button>
      </PageHeader>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Descripción</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Orden</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categorias.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{cat.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{cat.descripcion || '—'}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-500">{cat.orden}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(cat)} className="rounded-md p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600">
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setDeleting(cat); setConfirmOpen(true) }} className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar categoría' : 'Nueva categoría'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden de aparición</label>
            <input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="cat-activo" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="cat-activo" className="text-sm text-gray-700">Activa</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">{editing ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Eliminar categoría" message={`¿Eliminar "${deleting?.nombre}"?`} />
    </div>
  )
}

