// Ruta inexistente
exports.noEncontrado = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

// Errores no controlados (por ejemplo, MySQL caído o JSON mal formado)
exports.manejadorErrores = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON mal formado' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor (revisa la conexión a MySQL)' });
};
