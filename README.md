# CRUD de tareas – Backend y Frontend

Aplicación de tareas para Ingeniería de Software III. El backend (Sesión 6) es una API REST con Node.js, Express y SQLite organizada por capas. El frontend (Sesión 11) es una interfaz en HTML, CSS y JavaScript que consume esa API y corre aparte, en otro puerto.

## Entidad

**Tarea**: tiene `id`, `titulo`, `completada` (true/false) y `creada_en`.

## Cómo levantar todo

Se necesitan dos terminales, una para cada parte.

**Terminal 1: backend (puerto 3000)**

```bash
npm install
cp .env.example .env
npm run dev
```

**Terminal 2: frontend (puerto 5500)**

```bash
npm run front
```

Luego se abre http://localhost:5500 en el navegador. El frontend es solo archivos estáticos, así que también sirve cualquier otro servidor estático en el puerto 5500, por ejemplo `python -m http.server 5500 --directory front_end`.

La base de datos `data/app.db` y la tabla `tareas` se crean solas al arrancar el backend.

## CORS

Como el front (puerto 5500) y la API (puerto 3000) tienen orígenes distintos, el navegador bloquearía las peticiones. Se resolvió con el middleware `cors` en `src/app.js`, que solo acepta los orígenes de la variable `FRONTEND_ORIGIN` del `.env` (por defecto `http://localhost:5500` y `http://127.0.0.1:5500`) y los métodos GET, POST, PUT, PATCH y DELETE. Si el front se sirve desde otro puerto, hay que agregarlo en esa variable.

## Estructura

```
src/                              Backend por capas
├── app.js                        Express, CORS, middlewares y errores
├── db/database.js                Conexión a SQLite y creación de la tabla
├── routes/tareas.routes.js       Endpoints
├── controllers/                  Respuesta HTTP y códigos de estado
├── services/                     Validaciones y reglas de negocio
└── repositories/                 Consultas SQL
front_end/                        Frontend independiente
├── index.html                    Estructura: tarjetas, tabla y modales
├── styles.css                    Estilos
└── app.js                        Consumo de la API con fetch
docs/capturas/                    Evidencias de la demostración
```

## Endpoints

| Operación | Método | Ruta | Respuesta |
|---|---|---|---|
| Listar | GET | `/api/tareas` | 200 |
| Consultar por id | GET | `/api/tareas/:id` | 200 / 404 |
| Crear | POST | `/api/tareas` | 201 / 400 |
| Actualizar | PUT o PATCH | `/api/tareas/:id` | 200 / 400 / 404 |
| Eliminar | DELETE | `/api/tareas/:id` | 204 / 404 |

## Qué hace el frontend

- **Listado (GET):** al abrir la página pide las tareas a la API y las pinta en una tabla. Tres tarjetas arriba muestran el total, las pendientes y las completadas.
- **Crear y editar (POST / PUT):** un modal con un formulario. Se puede marcar una tarea como completada desde la tabla o desde el modal de edición.
- **Validaciones antes de enviar:** el título no puede estar vacío ni solo con espacios, debe tener entre 3 y 255 caracteres y al menos una letra. Si falla, se muestra el error bajo el campo y no se hace ninguna petición.
- **Respuestas del servidor:** una alerta verde para los éxitos (200, 201, 204) y una roja para los errores (400, 404, 500 o servidor caído), siempre con el código HTTP.
- **Eliminar (DELETE):** cada fila tiene un botón que abre un modal de confirmación antes de borrar.

## Demostración del ciclo completo

Las capturas se tomaron en el navegador con el front en el puerto 5500 y el backend en el 3000. Después de cada paso se consultó la base de datos `data/app.db` para comprobar que reflejaba el cambio.

**1. Validación en el formulario.** Con el título vacío, con solo números o con menos de 3 caracteres no se envía nada y la base de datos sigue vacía.

![Validación](docs/capturas/01-validacion-formulario.png)

**2. Crear (201 Created).** La tarea aparece en la tabla y la alerta sale en verde.

![Creada](docs/capturas/02-tarea-creada-201.png)

**3. Editar (200 OK).** Se cambia el título y se marca como completada.

![Modal de edición](docs/capturas/03-modal-editar.png)
![Actualizada](docs/capturas/04-tarea-actualizada-200.png)

**4. Eliminar con confirmación (204 No Content).**

![Confirmación](docs/capturas/05-confirmar-eliminacion.png)
![Eliminada](docs/capturas/06-tarea-eliminada-204.png)

**5. Recurso no encontrado (404 Not Found).** Con el modal de confirmación abierto, la tarea se borró por fuera de la interfaz. Al confirmar, el backend responde 404 y la alerta sale en rojo.

![Error 404](docs/capturas/07-error-404.png)

**Estado de la base de datos SQLite en cada paso**

| Paso | Contenido de la tabla `tareas` (id, titulo, completada) |
|---|---|
| Inicio y validaciones fallidas | vacía |
| Tras crear tres tareas | (1, Preparar la entrega del frontend, 0), (2, Escribir el README del proyecto, 0), (3, Grabar el video de la demostración, 0) |
| Tras editar la tarea 1 | (1, Terminar la entrega del frontend, 1), (2, …, 0), (3, …, 0) |
| Tras eliminar la tarea 2 | (1, Terminar la entrega del frontend, 1), (3, …, 0) |
| Tras el 404 (la tarea 3 ya no existe) | (1, Terminar la entrega del frontend, 1) |

## Pruebas del backend con cURL

```bash
# 201 Created
curl -i -X POST http://localhost:3000/api/tareas -H "Content-Type: application/json" -d '{"titulo":"Estudiar Node.js"}'

# 400 Bad Request
curl -i -X POST http://localhost:3000/api/tareas -H "Content-Type: application/json" -d '{}'

# 404 Not Found
curl -i http://localhost:3000/api/tareas/999
```
