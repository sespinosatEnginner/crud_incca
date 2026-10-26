// Modelo: único lugar que habla con la base de datos (SQL)
const pool = require('../config/db');

const COLUMNAS = 'id, titulo, completada';

// MySQL devuelve completada como 0/1; lo convertimos a booleano
const formatear = (fila) => ({
  id: fila.id,
  titulo: fila.titulo,
  completada: Boolean(fila.completada),
});

const Tarea = {
  async obtenerTodas() {
    const [filas] = await pool.query(`SELECT ${COLUMNAS} FROM tareas ORDER BY id`);
    return filas.map(formatear);
  },

  async obtenerPorId(id) {
    const [filas] = await pool.query(`SELECT ${COLUMNAS} FROM tareas WHERE id = ?`, [id]);
    return filas.length ? formatear(filas[0]) : null;
  },

  async crear(titulo) {
    const [resultado] = await pool.query('INSERT INTO tareas (titulo) VALUES (?)', [titulo]);
    return { id: resultado.insertId, titulo, completada: false };
  },

  // cambios: objeto con titulo y/o completada. Devuelve la tarea o null si no existe
  async actualizar(id, cambios) {
    const campos = [];
    const valores = [];

    if (cambios.titulo !== undefined) {
      campos.push('titulo = ?');
      valores.push(cambios.titulo);
    }
    if (cambios.completada !== undefined) {
      campos.push('completada = ?');
      valores.push(cambios.completada ? 1 : 0);
    }

    const [resultado] = await pool.query(
      `UPDATE tareas SET ${campos.join(', ')} WHERE id = ?`,
      [...valores, id]
    );
    if (resultado.affectedRows === 0) return null;
    return this.obtenerPorId(id);
  },

  // Devuelve la tarea eliminada o null si no existía
  async eliminar(id) {
    const tarea = await this.obtenerPorId(id);
    if (!tarea) return null;
    await pool.query('DELETE FROM tareas WHERE id = ?', [id]);
    return tarea;
  },
};

module.exports = Tarea;
