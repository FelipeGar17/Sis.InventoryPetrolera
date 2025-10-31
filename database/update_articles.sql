-- Actualizar estructura de tabla articles
USE inventario_petrolera;

-- Eliminar tabla antigua
DROP TABLE IF EXISTS articles;

-- Crear tabla con nuevos campos
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tipo VARCHAR(100),
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'unidad',
    stock_min INT DEFAULT 0,
    stock_current INT DEFAULT 0,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'FUNCIONANDO',
    acquisition_date DATE,
    observations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_tipo (tipo),
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de prueba
INSERT INTO articles (code, name, description, tipo, category, unit, stock_min, stock_current, location, status, acquisition_date, observations) 
VALUES 
    ('MAQ-001', 'Compresor Industrial 500HP', 'Compresor de aire industrial alta capacidad', 'Maquinaria Grande', 'Compresores', NULL, 0, 0, 'Planta Principal - Sector A', 'FUNCIONANDO', '2023-01-15', 'Mantenimiento preventivo cada 6 meses'),
    ('MAQ-002', 'Bomba Centrifuga 200GPM', 'Bomba centrifuga para transferencia de fluidos', 'Maquinaria Pequena', 'Bombas', NULL, 0, 0, 'Planta Principal - Sector B', 'MANTENIMIENTO', '2022-08-20', 'Requiere cambio de sello mecanico'),
    ('HER-001', 'Llave Inglesa 12"', 'Llave ajustable acero cromo vanadio', 'Herramienta de Mano', 'Llaves', 'unidad', 5, 15, 'Almacen Herramientas - E1', 'FUNCIONANDO', '2024-03-10', NULL),
    ('HER-002', 'Martillo Neumatico', 'Martillo neumatico industrial', 'Herramienta Electrica', 'Herramientas Electricas', 'unidad', 2, 8, 'Almacen Herramientas - E2', 'FUNCIONANDO', '2023-11-05', NULL);
