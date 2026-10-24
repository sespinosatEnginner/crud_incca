# CRUD de tareas: Node.js + Express + MySQL

## Requisitos
- Node.js 18 o superior
- MySQL 8 (o MariaDB) en ejecución

## Pasos
1. Crea la base de datos y la tabla ejecutando `schema.sql` en MySQL:
   ```bash
   mysql -u root -p < schema.sql
   ```
2. Copia `.env.example` como `.env` y pon tu usuario y contraseña de MySQL.
3. Instala dependencias y arranca:
   ```bash
   npm install
   npm start

   
   ```
4. Abre http://localhost:3000

## Endpoints
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/tareas` | Lista todas |
| GET | `/api/tareas/:id` | Obtiene una |
| POST | `/api/tareas` | Crea (`{"titulo": "..."}`) |
| PUT | `/api/tareas/:id` | Edita `titulo` y/o `completada` |
| DELETE | `/api/tareas/:id` | Elimina |

## Probar con curl
```bash
curl http://localhost:3000/api/tareas
curl -X POST http://localhost:3000/api/tareas -H "Content-Type: application/json" -d '{"titulo":"Nueva tarea"}'
curl -X PUT http://localhost:3000/api/tareas/1 -H "Content-Type: application/json" -d '{"completada":true}'
curl -X DELETE http://localhost:3000/api/tareas/1
```

## Problemas comunes
- `ER_ACCESS_DENIED_ERROR`: usuario o contraseña incorrectos en `.env`.
- `ER_BAD_DB_ERROR`: no ejecutaste `schema.sql`.
- `ECONNREFUSED`: MySQL no está encendido o el puerto es distinto.
- Si MySQL 8 pide autenticación `caching_sha2_password`, mysql2 ya la soporta; no necesitas cambiar nada.
