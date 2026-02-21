import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, getRoles } from '../services/endpoints'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const defaultForm = { nombre: '', apellido: '', email: '', telefono: '', password: '', rol_id: '', activo: true }

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState(defaultForm)

  const fetchData = async () => {
    try {
      const [usrRes, rolRes] = await Promise.all([getUsuarios(0, 200), getRoles(0, 100)])
      setUsuarios(usrRes.data)
      setRoles(rolRes.data)
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => { setEditing(null); setForm(defaultForm); setModalOpen(true) }

  const openEdit = (usr) => {
    setEditing(usr)
    setForm({
      nombre: usr.nombre, apellido: usr.apellido, email: usr.email,
      telefono: usr.telefono || '', password: '', rol_id: usr.rol_id, activo: usr.activo,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, rol_id: parseInt(form.rol_id) }
      if (!payload.password) delete payload.password
      if (editing) {
        await updateUsuario(editing.id, payload)
        toast.success('Usuario actualizado')
      } else {
        if (!form.password) { toast.error('La contraseña es obligatoria'); return }
        await createUsuario(payload)
        toast.success('Usuario creado')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar usuario')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUsuario(deleting.id)
      toast.success('Usuario eliminado')
      fetchData()
    } catch {
      toast.error('Error al eliminar usuario')
    }
  }

  if (loading) return <LoadingSpinner className="mt-32" size="lg" />

  return (
    <div>
      <PageHeader title="Usuarios" subtitle={`${usuarios.length} usuarios`}>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-4 w-4" /> Nuevo usuario
        </button>
      </PageHeader>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Rol</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((usr) => (
              <tr key={usr.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{usr.nombre} {usr.apellido}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{usr.email}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{usr.telefono || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{usr.rol?.nombre || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${usr.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {usr.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(usr)} className="rounded-md p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600">
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setDeleting(usr); setConfirmOpen(true) }} className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar usuario' : 'Nuevo usuario'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input type="text" required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña {editing && '(dejar vacío para no cambiar)'}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" placeholder={editing ? '••••••••' : ''} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select required value={form.rol_id} onChange={(e) => setForm({ ...form, rol_id: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none">
              <option value="">Seleccionar rol</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="usr-activo" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="usr-activo" className="text-sm text-gray-700">Activo</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">{editing ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Eliminar usuario" message={`¿Eliminar a ${deleting?.nombre} ${deleting?.apellido}?`} />
    </div>
  )
}

