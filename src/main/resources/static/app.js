// Mapea cada estado del backend con la clase CSS que cambia el color visual.
const estadoMap = {
  EN_PROCESO: 'en-proceso',
  PAGADO: 'pagado',
  CANCELADO: 'cancelado'
};

// Guarda los pagos cargados y el ID del elemento actualmente seleccionado.
const state = {
  pagos: [],
  selectedId: null
};

// Define las rutas del backend para crear, listar y cambiar pagos.
const api = {
  list: '/api/pagos',
  create: (monto) => `/api/pagos?monto=${encodeURIComponent(monto)}`,
  confirm: (id) => `/api/pagos/${id}/confirmar`,
  cancel: (id) => `/api/pagos/${id}/cancelar`,
  webhook: (id, status) => `/api/pagos/${id}/webhook/mercadopago`
};

// Guarda referencias a los elementos HTML importantes de la pantalla.
const els = {
  listaPagos: document.getElementById('listaPagos'),
  tituloPago: document.getElementById('tituloPago'),
  badgeEstado: document.getElementById('badgeEstado'),
  pagoId: document.getElementById('pagoId'),
  pagoMonto: document.getElementById('pagoMonto'),
  pagoEstado: document.getElementById('pagoEstado'),
  jsonPago: document.getElementById('jsonPago'),
  estadoGlobal: document.getElementById('estadoGlobal'),
  btnCrearPago: document.getElementById('btnCrearPago'),
  btnConfirmar: document.getElementById('btnConfirmar'),
  btnCancelar: document.getElementById('btnCancelar'),
  btnWebhookApproved: document.getElementById('btnWebhookApproved'),
  btnWebhookRejected: document.getElementById('btnWebhookRejected')
};

// Hace peticiones HTTP y lanza error si la respuesta no es exitosa.
async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error en la petición');
  }
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text();
}

// Formatea montos en soles peruanos para mostrarlo en la interfaz.
function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Renderiza la lista lateral de pagos con su estado y monto.
function renderListaPagos() {
  if (!state.pagos.length) {
    els.listaPagos.innerHTML = '<div class="pago-item"><div class="pago-meta"><strong>No hay pagos</strong><small>Crear uno para iniciar</small></div></div>';
    return;
  }

  els.listaPagos.innerHTML = state.pagos
    .slice()
    .reverse()
    .map((pago) => {
      const selected = pago.id === state.selectedId ? 'selected' : '';
      return `
        <div class="pago-item ${selected}" data-id="${pago.id}">
          <div class="pago-meta">
            <strong>Pago #${pago.id}</strong>
            <small>${formatCurrency(pago.monto)}</small>
          </div>
          <span class="pago-status ${estadoMap[pago.estado] || 'en-proceso'}">${pago.estado}</span>
        </div>
      `;
    }).join('');

  // Asigna el evento click a cada pago para seleccionarlo y mostrar su detalle.
  els.listaPagos.querySelectorAll('.pago-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = Number(item.dataset.id);
      const pago = state.pagos.find(x => x.id === id);
      if (pago) selectPago(pago);
    });
  });
}

// Carga el detalle del pago seleccionado y actualiza la interfaz visual.
function selectPago(pago) {
  state.selectedId = pago.id;
  els.tituloPago.textContent = `Pago #${pago.id}`;
  els.badgeEstado.className = `badge ${estadoMap[pago.estado] || 'en-proceso'}`;
  els.badgeEstado.textContent = pago.estado;
  els.pagoId.textContent = pago.id;
  els.pagoMonto.textContent = formatCurrency(pago.monto);
  els.pagoEstado.textContent = pago.estado;
  els.estadoGlobal.textContent = pago.estado;

  els.jsonPago.textContent = JSON.stringify({
    id: pago.id,
    monto: pago.monto,
    estado: pago.estado
  }, null, 2);

  renderListaPagos();
}

// Consulta todos los pagos desde la API y los guarda en memoria.
async function cargarPagos() {
  try {
    const pagos = await fetchJson(api.list);
    state.pagos = pagos;
    if (!state.selectedId && pagos.length) {
      selectPago(pagos[0]);
    }
    if (state.selectedId) {
      const pago = pagos.find(p => p.id === state.selectedId);
      if (pago) selectPago(pago);
    }
    renderListaPagos();
  } catch (error) {
    console.error(error);
    els.jsonPago.textContent = '{\n  "error": "No se pudo cargar la API"\n}';
  }
}

// Crea un nuevo pago con el monto ingresado por el usuario.
async function crearPago() {
  const monto = Number(window.prompt('Monto del pago', '150'));
  if (!monto || Number.isNaN(monto) || monto <= 0) {
    return;
  }

  try {
    const pago = await fetchJson(api.create(monto), { method: 'POST' });
    state.pagos.push(pago);
    state.selectedId = pago.id;
    selectPago(pago);
    renderListaPagos();
  } catch (error) {
    alert(error.message);
  }
}

// Envía la orden para confirmar el pago seleccionado.
async function confirmarPago() {
  if (!state.selectedId) return;
  try {
    const pago = await fetchJson(api.confirm(state.selectedId), { method: 'POST' });
    state.pagos = state.pagos.map(item => item.id === pago.id ? pago : item);
    selectPago(pago);
  } catch (error) {
    alert(error.message);
  }
}

// Envía la orden para cancelar el pago seleccionado.
async function cancelarPago() {
  if (!state.selectedId) return;
  try {
    const pago = await fetchJson(api.cancel(state.selectedId), { method: 'POST' });
    state.pagos = state.pagos.map(item => item.id === pago.id ? pago : item);
    selectPago(pago);
  } catch (error) {
    alert(error.message);
  }
}

// Simula un webhook de Mercado Pago para probar estados aprobados o rechazados.
async function webhook(status) {
  if (!state.selectedId) return;
  try {
    const pago = await fetchJson(api.webhook(state.selectedId, status), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    state.pagos = state.pagos.map(item => item.id === pago.id ? pago : item);
    selectPago(pago);
  } catch (error) {
    alert(error.message);
  }
}

// Vincula cada botón con su acción correspondiente.
els.btnCrearPago.addEventListener('click', crearPago);
els.btnConfirmar.addEventListener('click', confirmarPago);
els.btnCancelar.addEventListener('click', cancelarPago);
els.btnWebhookApproved.addEventListener('click', () => webhook('approved'));
els.btnWebhookRejected.addEventListener('click', () => webhook('rejected'));

// Carga inicial de pagos al abrir la pantalla.
cargarPagos();
