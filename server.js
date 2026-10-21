require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Convierte completada (0/1 de MySQL) a booleano
const formatear = (fila) => ({
  id: fila.id,
  titulo: fila.titulo,
  completada: Boolean(fila.completada),
});

// Envuelve los handlers async para capturar errores
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Sirve el front end
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// GET: listar todas las tareas
app.get(
  '/api/tareas',
  asyncHandler(async (req, res) => {
    const [filas] = await pool.query('SELECT id, titulo, completada FROM tareas ORDER BY id');
    res.json(filas.map(formatear));
  })
);

// GET: obtener una tarea por id
app.get(
  '/api/tareas/:id',
  asyncHandler(async (req, res) => {
    const [filas] = await pool.query(
      'SELECT id, titulo, completada FROM tareas WHERE id = ?',
      [req.params.id]
    );
    if (filas.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(formatear(filas[0]));
  })
);

// POST: crear una tarea
app.post(
  '/api/tareas',
  asyncHandler(async (req, res) => {
    const { titulo } = req.body;
    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
      return res.status(400).json({ error: 'El campo "titulo" es obligatorio' });
    }
    const [resultado] = await pool.query('INSERT INTO tareas (titulo) VALUES (?)', [titulo.trim()]);
    res.status(201).json({ id: resultado.insertId, titulo: titulo.trim(), completada: false });
  })
);

// PUT: actualizar una tarea (titulo y/o completada)
app.put(
  '/api/tareas/:id',
  asyncHandler(async (req, res) => {
    const { titulo, completada } = req.body;
    const campos = [];
    const valores = [];

    if (titulo !== undefined) {
      if (typeof titulo !== 'string' || !titulo.trim()) {
        return res.status(400).json({ error: '"titulo" no puede estar vacío' });
      }
      campos.push('titulo = ?');
      valores.push(titulo.trim());
    }
    if (completada !== undefined) {
      campos.push('completada = ?');
      valores.push(completada ? 1 : 0);
    }
    if (campos.length === 0) {
      return res.status(400).json({ error: 'Envía "titulo" y/o "completada" para actualizar' });
    }

    const [resultado] = await pool.query(
      `UPDATE tareas SET ${campos.join(', ')} WHERE id = ?`,
      [...valores, req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const [filas] = await pool.query(
      'SELECT id, titulo, completada FROM tareas WHERE id = ?',
      [req.params.id]
    );
    res.json(formatear(filas[0]));
  })
);

// DELETE: eliminar una tarea
app.delete(
  '/api/tareas/:id',
  asyncHandler(async (req, res) => {
    const [filas] = await pool.query(
      'SELECT id, titulo, completada FROM tareas WHERE id = ?',
      [req.params.id]
    );
    if (filas.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });

    await pool.query('DELETE FROM tareas WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Tarea eliminada', tarea: formatear(filas[0]) });
  })
);

// Manejo de errores general (por ejemplo, MySQL caído)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor (revisa la conexión a MySQL)' });
});

// Verifica la conexión a MySQL al arrancar
pool
  .query('SELECT 1')
  .then(() => console.log('Conectado a MySQL'))
  .catch((err) => console.error('No se pudo conectar a MySQL:', err.message));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
