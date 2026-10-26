// Configuración de Express: middlewares, rutas y manejo de errores
const express = require('express');
const cors = require('cors');
const tareaRoutes = require('./routes/tarea.routes');
const { noEncontrado, manejadorErrores } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tareas', tareaRoutes);

app.use(noEncontrado);
app.use(manejadorErrores);

module.exports = app;
