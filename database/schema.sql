-- Script de creación de base de datos
-- Sistema de Inventario y Documentación Técnica - Central Petrolera

CREATE DATABASE IF NOT EXISTS inventario_petrolera 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE inventario_petrolera;

-- Tabla de artículos
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'unidad',
    stock_min INT DEFAULT 0,
    stock_current INT DEFAULT 0,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVO',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

