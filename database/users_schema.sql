-- Tabla de usuarios
USE inventario_petrolera;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    role ENUM('ADMIN', 'USER') DEFAULT 'USER',
    status VARCHAR(20) DEFAULT 'ACTIVO',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario administrador
-- Password: admin123
DELETE FROM users WHERE username = 'admin';

INSERT INTO users (username, email, password_hash, full_name, role, status) 
VALUES ('admin', 'admin@petrolera.com', '$2b$12$kWg/aDUaG.c2YAxU6WtR.eml.Syq6VvdaQarHHFsk1kf9PJXSwBXa', 'Administrador del Sistema', 'ADMIN', 'ACTIVO');
