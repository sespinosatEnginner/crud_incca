// Controlador: valida la petición, llama al modelo y arma la respuesta HTTP
const Tarea = require('../models/tarea.model');

const tituloValido = (t) => typeof t === 'string' && t.trim().length > 0;

exports.listar = async (req, res) => {
  res.json(await Tarea.obtenerTodas());
};

exports.obtener = async (req, res) => {
  const tarea = await Tarea.obtenerPorId(req.params.id);
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(tarea);
};

exports.crear = async (req, res) => {
  const { titulo } = req.body;
  if (!tituloValido(titulo)) {
    return res.status(400).json({ error: 'El campo "titulo" es obligatorio' });
  }
  const nueva = await Tarea.crear(titulo.trim());
  res.status(201).json(nueva);
};

exports.actualizar = async (req, res) => {
  const { titulo, completada } = req.body;
  const cambios = {};

  if (titulo !== undefined) {
    if (!tituloValido(titulo)) {
      return res.status(400).json({ error: '"titulo" no puede estar vacío' });
    }
    cambios.titulo = titulo.trim();
  }
  if (completada !== undefined) cambios.completada = completada;

  if (Object.keys(cambios).length === 0) {
    return res.status(400).json({ error: 'Envía "titulo" y/o "completada" para actualizar' });
  }

  const tarea = await Tarea.actualizar(req.params.id, cambios);
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(tarea);
};

exports.eliminar = async (req, res) => {
  const tarea = await Tarea.eliminar(req.params.id);
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json({ mensaje: 'Tarea eliminada', tarea });
};
