const statusColors = {
  // Mesas
  disponible: 'bg-green-100 text-green-700',
  ocupada: 'bg-red-100 text-red-700',
  reservada: 'bg-yellow-100 text-yellow-700',
  // Órdenes
  abierta: 'bg-blue-100 text-blue-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  en_preparacion: 'bg-blue-100 text-blue-700',
  lista: 'bg-purple-100 text-purple-700',
  entregada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
  pagada: 'bg-emerald-100 text-emerald-700',
  // Cortes
  abierto: 'bg-green-100 text-green-700',
  cerrado: 'bg-gray-100 text-gray-700',
  // General
  activo: 'bg-green-100 text-green-700',
  inactivo: 'bg-gray-100 text-gray-500',
}

const statusLabels = {
  disponible: 'Disponible',
  ocupada: 'Ocupada',
  reservada: 'Reservada',
  abierta: 'Abierta',
  pendiente: 'Pendiente',
  en_preparacion: 'En preparación',
  lista: 'Lista',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
  pagada: 'Pagada',
  abierto: 'Abierto',
  cerrado: 'Cerrado',
  activo: 'Activo',
  inactivo: 'Inactivo',
}

export default function StatusBadge({ status }) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-600'
  const label = statusLabels[status] || status

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  )
}

