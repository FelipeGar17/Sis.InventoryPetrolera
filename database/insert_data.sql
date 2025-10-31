-- Insertar datos de prueba sin tildes
USE inventario_petrolera;

DELETE FROM articles;

INSERT INTO articles (code, name, description, category, unit, stock_min, stock_current, location, status) 
VALUES 
    ('ART-001', 'Valvula de compuerta 4"', 'Valvula de acero inoxidable', 'Valvulas', 'unidad', 5, 12, 'Almacen A-1', 'ACTIVO'),
    ('ART-002', 'Filtro de aceite hidraulico', 'Filtro para sistema hidraulico', 'Filtros', 'unidad', 10, 25, 'Almacen A-2', 'ACTIVO'),
    ('ART-003', 'Aceite lubricante SAE 40', 'Aceite para motores industriales', 'Lubricantes', 'litros', 100, 450, 'Almacen B-1', 'ACTIVO');
