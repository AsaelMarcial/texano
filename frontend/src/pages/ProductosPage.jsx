import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, PencilSquareIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { getProductos, getCategorias, createProducto, updateProducto, deleteProducto, uploadImagen } from '../services/endpoints'
import PageHeader from '../components/ui/PageHeader'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const defaultForm = {
  nombre: '', descripcion: '', precio: '', categoria_id: '',
  disponible: true, activo: true, es_granel: false,
}

export default function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)
  const fileInputRef = useRef(null)

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([getProductos(0, 500), getCategorias(0, 200)])
      setProductos(prodRes.data)
      setCategorias(catRes.data)
    } catch {
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setImagenFile(null)
    setImagenPreview(null)
    setModalOpen(true)
  }

  const openEdit = (prod) => {
    setEditing(prod)
    setForm({
      nombre: prod.nombre, descripcion: prod.descripcion || '', precio: prod.precio,
      categoria_id: prod.categoria_id,
      disponible: prod.disponible, activo: prod.activo, es_granel: prod.es_granel || false,
    })
    setImagenFile(null)
    setImagenPreview(prod.imagen_url || null)
    setModalOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG o WebP')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe exceder 5 MB')
      return
    }
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // 1. Si hay imagen nueva, subirla primero
      let imagen_url = editing?.imagen_url || null
      if (imagenFile) {
        const { data } = await uploadImagen(imagenFile)
        imagen_url = data.url
      }

      // 2. Crear/actualizar producto
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        precio: parseFloat(form.precio) || 0,
        categoria_id: parseInt(form.categoria_id),
        imagen_url,
        disponible: form.disponible,
        activo: form.activo,
        es_granel: form.es_granel,
      }

      if (editing) {
        await updateProducto(editing.id, payload)
        toast.success('Producto actualizado')
      } else {
        await createProducto(payload)
        toast.success('Producto creado')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar producto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProducto(deleting.id)
      toast.success('Producto eliminado')
      fetchData()
    } catch {
      toast.error('Error al eliminar producto')
    }
  }

  const filtered = filtroCategoria
    ? productos.filter((p) => p.categoria_id === parseInt(filtroCategoria))
    : productos

  if (loading) return <LoadingSpinner className="mt-32" size="lg" />

  return (
    <div>
      <PageHeader title="Productos / Menú" subtitle={`${productos.length} productos`}>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-4 w-4" /> Nuevo producto
        </button>
      </PageHeader>

      {/* Grid de productos */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((prod) => (
          <div key={prod.id} className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md active:shadow-md transition-shadow">
            {prod.imagen_url ? (
              <img src={prod.imagen_url} alt={prod.nombre} className="h-28 sm:h-40 w-full object-cover" />
            ) : (
              <div className="flex h-28 sm:h-40 items-center justify-center bg-gray-100 text-gray-400 text-sm">
                <PhotoIcon className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            )}
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{prod.nombre}</h3>
                  <p className="text-xs text-gray-500">{prod.categoria?.nombre || '—'}</p>
                </div>
                <span className="text-lg font-bold text-texano-500">
                  {prod.es_granel ? '⚖️ Granel' : `$${parseFloat(prod.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              {prod.descripcion && (
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{prod.descripcion}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${prod.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {prod.disponible ? 'Disponible' : 'No disponible'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(prod)} className="rounded-md p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600">
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => { setDeleting(prod); setConfirmOpen(true) }} className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal crear/editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del producto</label>
            <div className="flex items-center gap-4">
              {imagenPreview ? (
                <img src={imagenPreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover ring-1 ring-gray-200" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 ring-1 ring-gray-200">
                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <PhotoIcon className="h-4 w-4" />
                  {imagenPreview ? 'Cambiar imagen' : 'Subir imagen'}
                </button>
                <p className="mt-1 text-xs text-gray-400">JPG, PNG o WebP. Máx 5 MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
              <input type="number" step="0.01" required value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select required value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none">
                <option value="">Seleccionar</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="prod-disponible" checked={form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
              <label htmlFor="prod-disponible" className="text-sm text-gray-700">Disponible</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="prod-activo" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
              <label htmlFor="prod-activo" className="text-sm text-gray-700">Activo</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="prod-granel" checked={form.es_granel} onChange={(e) => setForm({ ...form, es_granel: e.target.checked, precio: e.target.checked ? '0' : form.precio })} className="h-4 w-4 rounded border-amber-500 text-amber-600" />
              <label htmlFor="prod-granel" className="text-sm text-gray-700">⚖️ A granel</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
              {saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Eliminar producto" message={`¿Eliminar "${deleting?.nombre}"?`} />
    </div>
  )
}

