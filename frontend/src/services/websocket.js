/**
 * Servicio WebSocket para recibir notificaciones en tiempo real.
 * Usado en la PC principal para detectar nuevas órdenes
 * creadas desde los teléfonos de los meseros.
 */

const WS_RECONNECT_DELAY = 3000 // ms antes de reconectar
const WS_MAX_RECONNECT_DELAY = 30000 // máximo delay de reconexión

/**
 * Construye la URL del WebSocket basada en la ubicación actual.
 */
function getWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${protocol}//${host}/ws/ordenes`
}

/**
 * Crea y administra una conexión WebSocket con reconexión automática.
 * @param {function} onMessage - Callback que recibe el mensaje parseado (JSON)
 * @returns {{ close: function }} - Objeto con método para cerrar la conexión
 */
export function connectOrdersWebSocket(onMessage) {
  let ws = null
  let reconnectDelay = WS_RECONNECT_DELAY
  let reconnectTimer = null
  let closed = false

  function connect() {
    if (closed) return

    try {
      ws = new WebSocket(getWsUrl())
    } catch {
      scheduleReconnect()
      return
    }

    ws.onopen = () => {
      console.log('[WS] Conectado a /ws/ordenes')
      reconnectDelay = WS_RECONNECT_DELAY // Reset delay on successful connection
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (err) {
        console.warn('[WS] Error parsing message:', err)
      }
    }

    ws.onclose = () => {
      console.log('[WS] Conexión cerrada')
      if (!closed) scheduleReconnect()
    }

    ws.onerror = () => {
      // onclose se disparará después de onerror
    }
  }

  function scheduleReconnect() {
    if (closed) return
    console.log(`[WS] Reconectando en ${reconnectDelay / 1000}s...`)
    reconnectTimer = setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 1.5, WS_MAX_RECONNECT_DELAY)
      connect()
    }, reconnectDelay)
  }

  connect()

  return {
    close() {
      closed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (ws) {
        ws.onclose = null // Prevent reconnect on intentional close
        ws.close()
      }
    },
  }
}

// ── Estación principal (PC con impresora) ──

const STORAGE_KEY = 'pos_estacion_principal'

export function isEstacionPrincipal() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function setEstacionPrincipal(value) {
  localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false')
}
