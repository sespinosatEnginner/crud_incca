// Dirección del backend (otro puerto, por eso se necesita CORS)
const API_URL = 'http://localhost:3000/api/tareas';

const NOMBRES_HTTP = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  404: 'Not Found',
  500: 'Internal Server Error',
};

// ---------- Referencias al DOM ----------
const tbody = document.getElementById('tbody');
const mensajeTabla = document.getElementById('mensaje-tabla');
const alerta = document.getElementById('alerta');
const alertaTexto = document.getElementById('alerta-texto');

const modalForm = document.getElementById('modal-form');
const formTarea = document.getElementById('form-tarea');
const modalFormTitulo = document.getElementById('modal-form-titulo');
const inputTitulo = document.getElementById('titulo');
const errorTitulo = document.getElementById('error-titulo');
const filaCompletada = document.getElementById('fila-completada');
const inputCompletada = document.getElementById('completada');
const btnGuardar = document.getElementById('btn-guardar');

const modalEliminar = document.getElementById('modal-eliminar');
const textoEliminar = document.getElementById('texto-eliminar');

let tareas = [];
let tareaEnEdicion = null;   // null = creando
let tareaPorEliminar = null;
let temporizadorAlerta;

// ---------- Alertas ----------
function mostrarAlerta(tipo, texto, status) {
  const prefijo = status ? `${status} ${NOMBRES_HTTP[status] || ''} · ` : '';
  alerta.className = `alerta ${tipo}`;
  alertaTexto.textContent = prefijo + texto;
  clearTimeout(temporizadorAlerta);
  temporizadorAlerta = setTimeout(ocultarAlerta, 6000);
}

function ocultarAlerta() {
  alerta.classList.add('oculto');
}

document.getElementById('alerta-cerrar').addEventListener('click', ocultarAlerta);

function alertaDeError(err) {
  mostrarAlerta('error', err.message, err.status || null);
}

// ---------- Peticiones a la API ----------
class ErrorApi extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

async function peticion(url, opciones = {}) {
  let res;
  try {
    res = await fetch(url, opciones);
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Revisa que el backend esté corriendo en el puerto 3000.');
  }

  if (res.status === 204) return { status: 204, data: null };

  let data = null;
  try { data = await res.json(); } catch { /* respuesta sin JSON */ }

  if (!res.ok) throw new ErrorApi(res.status, (data && data.error) || 'Error en la petición');
  return { status: res.status, data };
}

const enviarJSON = (metodo, cuerpo) => ({
  method: metodo,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(cuerpo),
});

// ---------- Listado (GET) ----------
async function cargarTareas() {
  try {
    const { data } = await peticion(API_URL);
    tareas = data;
    pintarTabla();
  } catch (err) {
    tareas = [];
    pintarTabla();
    mensajeTabla.textContent = 'No se pudieron cargar las tareas.';
    alertaDeError(err);
  }
}

// La API envía la fecha en ISO (ej. "2026-11-25T15:00:00.000Z"); si falta, no rompe la tabla
function formatearFecha(valor) {
  if (!valor) return '—';
  const fecha = new Date(valor);
  return isNaN(fecha) ? String(valor) : fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

function crearCelda(contenido, clase) {
  const td = document.createElement('td');
  if (clase) td.className = clase;
  if (contenido instanceof Node) td.appendChild(contenido);
  else td.textContent = contenido;
  return td;
}

function pintarTabla() {
  tbody.replaceChildren();

  tareas.forEach((t) => {
    const tr = document.createElement('tr');

    const badge = document.createElement('span');
    badge.className = `badge ${t.completada ? 'completada' : 'pendiente'}`;
    badge.textContent = t.completada ? 'Completada' : 'Pendiente';

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = t.completada;
    check.title = 'Marcar como completada';
    check.addEventListener('change', () => cambiarEstado(t, check.checked));

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-chico';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => abrirFormulario(t));

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn btn-chico btn-peligro';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => abrirConfirmacion(t));

    const acciones = document.createElement('div');
    acciones.className = 'acciones';
    acciones.append(check, btnEditar, btnEliminar);

    tr.append(
      crearCelda(String(t.id)),
      crearCelda(t.titulo, t.completada ? 'titulo-hecha' : ''),
      crearCelda(badge),
      crearCelda(formatearFecha(t.creada_en)),
      crearCelda(acciones)
    );
    tbody.appendChild(tr);
  });

  const hechas = tareas.filter((t) => t.completada).length;
  document.getElementById('n-total').textContent = tareas.length;
  document.getElementById('n-completadas').textContent = hechas;
  document.getElementById('n-pendientes').textContent = tareas.length - hechas;

  mensajeTabla.classList.toggle('oculto', tareas.length > 0);
  if (tareas.length === 0) mensajeTabla.textContent = 'Todavía no hay tareas. Crea la primera con el botón "Nueva tarea".';
}

// ---------- Formulario (POST / PUT) ----------
function validarTitulo(valor) {
  const titulo = valor.trim();
  if (!titulo) return 'El título es obligatorio.';
  if (titulo.length < 3) return 'El título debe tener al menos 3 caracteres.';
  if (titulo.length > 255) return 'El título no puede superar los 255 caracteres.';
  if (!/\p{L}/u.test(titulo)) return 'El título debe incluir al menos una letra.';
  return '';
}

function mostrarErrorCampo(msg) {
  errorTitulo.textContent = msg;
  inputTitulo.classList.toggle('invalido', Boolean(msg));
}

function abrirFormulario(tarea = null) {
  tareaEnEdicion = tarea;
  mostrarErrorCampo('');
  modalFormTitulo.textContent = tarea ? 'Editar tarea' : 'Nueva tarea';
  inputTitulo.value = tarea ? tarea.titulo : '';
  inputCompletada.checked = tarea ? tarea.completada : false;
  filaCompletada.classList.toggle('oculto', !tarea);
  modalForm.showModal();
  inputTitulo.focus();
}

document.getElementById('btn-nueva').addEventListener('click', () => abrirFormulario());
document.getElementById('btn-cancelar').addEventListener('click', () => modalForm.close());
inputTitulo.addEventListener('input', () => mostrarErrorCampo(''));

formTarea.addEventListener('submit', async (e) => {
  e.preventDefault();

  const error = validarTitulo(inputTitulo.value);
  if (error) {
    mostrarErrorCampo(error);
    inputTitulo.focus();
    return; // no se envía nada al servidor
  }

  const titulo = inputTitulo.value.trim();
  btnGuardar.disabled = true;

  try {
    if (tareaEnEdicion) {
      const cuerpo = { titulo, completada: inputCompletada.checked };
      const { status } = await peticion(`${API_URL}/${tareaEnEdicion.id}`, enviarJSON('PUT', cuerpo));
      mostrarAlerta('exito', 'Tarea actualizada correctamente.', status);
    } else {
      const { status } = await peticion(API_URL, enviarJSON('POST', { titulo }));
      mostrarAlerta('exito', 'Tarea creada correctamente.', status);
    }
    modalForm.close();
  } catch (err) {
    modalForm.close();
    alertaDeError(err);
  } finally {
    btnGuardar.disabled = false;
    cargarTareas();
  }
});

async function cambiarEstado(tarea, completada) {
  try {
    const { status } = await peticion(`${API_URL}/${tarea.id}`, enviarJSON('PUT', { completada }));
    mostrarAlerta('exito', completada ? 'Tarea marcada como completada.' : 'Tarea marcada como pendiente.', status);
  } catch (err) {
    alertaDeError(err);
  } finally {
    cargarTareas();
  }
}

// ---------- Eliminación (DELETE) ----------
function abrirConfirmacion(tarea) {
  tareaPorEliminar = tarea;
  textoEliminar.textContent = `¿Seguro que quieres eliminar "${tarea.titulo}"? Esta acción no se puede deshacer.`;
  modalEliminar.showModal();
}

document.getElementById('btn-no-eliminar').addEventListener('click', () => modalEliminar.close());

document.getElementById('btn-si-eliminar').addEventListener('click', async () => {
  modalEliminar.close();
  try {
    const { status } = await peticion(`${API_URL}/${tareaPorEliminar.id}`, { method: 'DELETE' });
    mostrarAlerta('exito', 'Tarea eliminada correctamente.', status);
  } catch (err) {
    alertaDeError(err);
  } finally {
    cargarTareas();
  }
});

cargarTareas();
