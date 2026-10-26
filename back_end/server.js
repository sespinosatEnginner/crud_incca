// Punto de entrada: arranca el servidor y verifica la conexión a la BD
require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

pool
  .query('SELECT 1')
  .then(() => console.log('Conectado a MySQL'))
  .catch((err) => console.error('No se pudo conectar a MySQL:', err.message));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
