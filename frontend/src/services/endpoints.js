import api from './api'

/* ── Auth ── */
export const login = (email, password) =>
  api.post('/auth/login', { email, password })

/* ── Roles ── */
export const getRoles = (skip = 0, limit = 100) =>
  api.get('/roles', { params: { skip, limit } })
export const getRol = (id) => api.get(`/roles/${id}`)
export const createRol = (data) => api.post('/roles', data)
export const updateRol = (id, data) => api.put(`/roles/${id}`, data)
export const deleteRol = (id) => api.delete(`/roles/${id}`)

/* ── Usuarios ── */
export const getUsuarios = (skip = 0, limit = 100) =>
  api.get('/usuarios', { params: { skip, limit } })
export const getUsuario = (id) => api.get(`/usuarios/${id}`)
export const createUsuario = (data) => api.post('/usuarios', data)
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data)
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`)

/* ── Mesas ── */
export const getMesas = (skip = 0, limit = 100) =>
  api.get('/mesas', { params: { skip, limit } })
export const getMesa = (id) => api.get(`/mesas/${id}`)
export const createMesa = (data) => api.post('/mesas', data)
export const updateMesa = (id, data) => api.put(`/mesas/${id}`, data)
export const deleteMesa = (id) => api.delete(`/mesas/${id}`)

/* ── Categorías ── */
export const getCategorias = (skip = 0, limit = 100) =>
  api.get('/categorias', { params: { skip, limit } })
export const getCategoria = (id) => api.get(`/categorias/${id}`)
export const createCategoria = (data) => api.post('/categorias', data)
export const updateCategoria = (id, data) => api.put(`/categorias/${id}`, data)
export const deleteCategoria = (id) => api.delete(`/categorias/${id}`)

/* ── Productos ── */
export const getProductos = (skip = 0, limit = 100) =>
  api.get('/productos', { params: { skip, limit } })
export const getProducto = (id) => api.get(`/productos/${id}`)
export const createProducto = (data) => api.post('/productos', data)
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data)
export const deleteProducto = (id) => api.delete(`/productos/${id}`)

/* ── Órdenes ── */
export const getOrdenes = (skip = 0, limit = 100, estado = null) =>
  api.get('/ordenes', { params: { skip, limit, ...(estado && { estado }) } })
export const getOrden = (id) => api.get(`/ordenes/${id}`)
export const createOrden = (data) => api.post('/ordenes', data)
export const updateOrden = (id, data) => api.put(`/ordenes/${id}`, data)
export const deleteOrden = (id) => api.delete(`/ordenes/${id}`)

/* ── Detalle de Orden ── */
export const getDetallesOrden = (ordenId) =>
  api.get('/detalles-orden', { params: { orden_id: ordenId } })
export const createDetalleOrden = (data) => api.post('/detalles-orden', data)
export const updateDetalleOrden = (id, data) =>
  api.put(`/detalles-orden/${id}`, data)
export const deleteDetalleOrden = (id) => api.delete(`/detalles-orden/${id}`)

/* ── Pagos ── */
export const getPagos = (skip = 0, limit = 100) =>
  api.get('/pagos', { params: { skip, limit } })
export const getPago = (id) => api.get(`/pagos/${id}`)
export const createPago = (data) => api.post('/pagos', data)

/* ── Corte de Caja ── */
export const getCortesCaja = (skip = 0, limit = 100) =>
  api.get('/cortes-caja', { params: { skip, limit } })
export const getCorteCaja = (id) => api.get(`/cortes-caja/${id}`)
export const createCorteCaja = (data) => api.post('/cortes-caja', data)
export const closeCorteCaja = (id, data) =>
  api.put(`/cortes-caja/${id}/cerrar`, data)

/* ── Uploads ── */
export const uploadImagen = (file) => {
  const formData = new FormData()
  formData.append('archivo', file)
  return api.post('/uploads/imagen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

