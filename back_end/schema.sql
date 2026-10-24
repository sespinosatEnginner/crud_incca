-- Ejecuta este script una vez en MySQL (Workbench, consola o phpMyAdmin)
CREATE DATABASE IF NOT EXISTS crud_tareas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crud_tareas;

CREATE TABLE IF NOT EXISTS tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  completada TINYINT(1) NOT NULL DEFAULT 0,
  creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Datos de ejemplo
INSERT INTO tareas (titulo, completada) VALUES
  ('Estudiar Node.js', 0),
  ('Practicar Express', 1),
  ('Conectar con MySQL', 0);
