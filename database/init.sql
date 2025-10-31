-- Script de inicialización para Docker
-- Se ejecuta automáticamente al crear el contenedor MySQL

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS inventario_petrolera CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inventario_petrolera;

-- Las tablas se crean automáticamente por SQLAlchemy
-- Este script solo asegura que la base de datos existe

-- Crear usuario administrador por defecto
-- Password: admin123 (hash bcrypt)
INSERT IGNORE INTO users (id, username, email, full_name, password, role, status, created_at) 
VALUES (
    1,
    'admin',
    'admin@petrolera.com',
    'Administrador',
    '$2b$12$ZGE0N2M3MGRhZGE2MDk4Z.YzM2N2I3NmY2M2I3NmY2M2I3NmY2M2I3',
    'ADMIN',
    'ACTIVO',
    NOW()
);

-- Datos de ejemplo (opcional)
INSERT IGNORE INTO articles (code, name, description, tipo, category, unit, stock_min, stock_current, location, status, acquisition_date) VALUES
('MAQ-001', 'Bomba Centrífuga 500HP', 'Bomba para transferencia de crudo', 'Maquinaria Grande', 'Bombas', 'unidad', 0, 0, 'Estación Principal', 'FUNCIONANDO', '2023-01-15'),
('HER-001', 'Llave Inglesa 24"', 'Llave ajustable profesional', 'Herramienta de Mano', 'Herramientas Manuales', 'pieza', 5, 12, 'Almacén Central', 'FUNCIONANDO', '2023-03-20');
