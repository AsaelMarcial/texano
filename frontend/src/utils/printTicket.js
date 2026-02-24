/**
 * Utilidades de impresión de tickets para impresora térmica (58mm).
 * Usa window.open + window.print para generar tickets.
 */

const RESTAURANT_NAME = 'El Texano'
const RESTAURANT_SLOGAN = '¡Buen provecho!'
const TICKET_WIDTH = '58mm'

/**
 * Abre una ventana con el contenido HTML y lanza la impresión.
 */
function openPrintWindow(htmlContent) {
  const win = window.open('', '_blank', 'width=250,height=600')
  if (!win) {
    alert('Por favor permite las ventanas emergentes para imprimir tickets.')
    return
  }
  win.document.write(htmlContent)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.close()
  }, 400)
}

/**
 * Estilos base para tickets térmicos.
 */
function ticketStyles() {
  return `
    <style>
      @page {
        size: ${TICKET_WIDTH} auto;
        margin: 0;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        width: ${TICKET_WIDTH};
        padding: 3mm 2mm;
        color: #000;
        font-weight: bold;
      }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .big { font-size: 13px; }
      .small { font-size: 8px; }
      .line { border-top: 1px dashed #000; margin: 3px 0; }
      .double-line { border-top: 2px solid #000; margin: 3px 0; }
      .row { display: flex; justify-content: space-between; font-size: 9px; }
      .items { width: 100%; }
      .items td { padding: 1px 0; vertical-align: top; font-size: 9px; }
      .items .qty { width: 20px; text-align: center; }
      .items .name { word-wrap: break-word; max-width: 30mm; }
      .items .price { text-align: right; white-space: nowrap; padding-left: 2px; }
      .mt { margin-top: 4px; }
      .mb { margin-bottom: 4px; }
    </style>
  `
}

/**
 * Formatea un número como moneda MXN.
 */
function money(val) {
  return '$' + parseFloat(val || 0).toFixed(2)
}

/**
 * Formatea fecha/hora legible.
 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/**
 * TICKET DE ORDEN (para cocina) — se imprime al crear orden.
 */
export function printTicketOrden(orden) {
  const items = (orden.detalles || []).map((d) => `
    <tr>
      <td class="qty">${d.cantidad}x</td>
      <td class="name">${d.producto_nombre || 'Producto #' + d.producto_id}</td>
      <td class="price">${money(d.subtotal)}</td>
    </tr>
    ${d.notas ? `<tr><td></td><td colspan="2" class="small">→ ${d.notas}</td></tr>` : ''}
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${ticketStyles()}</head>
    <body>
      <div class="center bold big mb">${RESTAURANT_NAME}</div>
      <div class="center bold mb">── ORDEN DE COCINA ──</div>
      <div class="line"></div>

      <div class="row"><span>Orden:</span><span class="bold">${orden.numero_orden}</span></div>
      <div class="row"><span>Mesa:</span><span class="bold">${orden.mesa_id || 'S/M'}</span></div>
      <div class="row"><span>Tipo:</span><span>${(orden.tipo || '').replace('_', ' ')}</span></div>
      <div class="row"><span>Fecha:</span><span>${formatDate(orden.creado_en)}</span></div>

      <div class="double-line"></div>

      <table class="items" cellspacing="0">
        <tbody>${items}</tbody>
      </table>

      <div class="double-line"></div>

      ${orden.notas ? `<div class="mt small"><b>Notas:</b> ${orden.notas}</div>` : ''}

      <div class="center mt bold">TOTAL: ${money(orden.total)}</div>

      <div class="line mt"></div>
      <div class="center small mt">${formatDate(new Date().toISOString())}</div>
    </body>
    </html>
  `
  openPrintWindow(html)
}

/**
 * TICKET DE PAGO (para cliente) — se imprime al cobrar.
 */
export function printTicketPago(orden, pagoInfo = {}) {
  const items = (orden.detalles || []).map((d) => `
    <tr>
      <td class="qty">${d.cantidad}x</td>
      <td class="name">${d.producto_nombre || 'Producto #' + d.producto_id}</td>
      <td class="price">${money(d.subtotal)}</td>
    </tr>
  `).join('')

  const metodoLabel = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
  }[pagoInfo.metodo_pago] || pagoInfo.metodo_pago || ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${ticketStyles()}</head>
    <body>
      <div class="center bold big mb">${RESTAURANT_NAME}</div>
      <div class="center small mb">Ticket de venta</div>
      <div class="line"></div>

      <div class="row"><span>Orden:</span><span class="bold">${orden.numero_orden}</span></div>
      <div class="row"><span>Mesa:</span><span>${orden.mesa_id || 'S/M'}</span></div>
      <div class="row"><span>Fecha:</span><span>${formatDate(orden.creado_en)}</span></div>

      <div class="double-line"></div>

      <table class="items" cellspacing="0">
        <tbody>${items}</tbody>
      </table>

      <div class="line"></div>

      <div class="row"><span>Subtotal:</span><span>${money(orden.subtotal)}</span></div>
      <div class="row"><span>IVA (16%):</span><span>${money(orden.impuesto)}</span></div>
      <div class="double-line"></div>
      <div class="row bold big"><span>TOTAL:</span><span>${money(orden.total)}</span></div>
      <div class="line"></div>

      <div class="row mt"><span>Método:</span><span class="bold">${metodoLabel}</span></div>
      ${pagoInfo.monto_recibido ? `<div class="row"><span>Recibido:</span><span>${money(pagoInfo.monto_recibido)}</span></div>` : ''}
      ${pagoInfo.cambio ? `<div class="row bold"><span>Cambio:</span><span>${money(pagoInfo.cambio)}</span></div>` : ''}

      <div class="line mt"></div>
      <div class="center mt bold">${RESTAURANT_SLOGAN}</div>
      <div class="center small mt">Gracias por su preferencia</div>
      <div class="center small mt">${formatDate(new Date().toISOString())}</div>

      <br/>
    </body>
    </html>
  `
  openPrintWindow(html)
}

