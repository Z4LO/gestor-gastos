-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gastos_personales;
USE gastos_personales;

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo ENUM('ingreso', 'egreso') NOT NULL,
    color VARCHAR(7) DEFAULT '#3498db',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo)
);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS transacciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    tipo ENUM('ingreso', 'egreso') NOT NULL,
    categoria_id INT,
    fecha DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_fecha (fecha),
    INDEX idx_tipo (tipo),
    INDEX idx_categoria (categoria_id)
);

-- Insertar categorías por defecto
INSERT IGNORE INTO categorias (nombre, tipo, color) VALUES
-- Categorías de Ingresos
('Salario', 'ingreso', '#27ae60'),
('Freelance', 'ingreso', '#2ecc71'),
('Inversiones', 'ingreso', '#16a085'),
('Bonos', 'ingreso', '#1abc9c'),
('Venta de artículos', 'ingreso', '#52c41a'),

-- Categorías de Egresos
('Alimentos', 'egreso', '#e74c3c'),
('Transporte', 'egreso', '#f39c12'),
('Entretenimiento', 'egreso', '#9b59b6'),
('Salud', 'egreso', '#e67e22'),
('Educación', 'egreso', '#3498db'),
('Servicios', 'egreso', '#34495e'),
('Compras', 'egreso', '#95a5a6'),
('Hogar', 'egreso', '#8e44ad'),
('Seguros', 'egreso', '#2c3e50'),
('Impuestos', 'egreso', '#d35400');

-- Tabla de gastos recurrentes
CREATE TABLE IF NOT EXISTS gastos_recurrentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    tipo ENUM('ingreso', 'egreso') NOT NULL,
    categoria_id INT,
    dia_mes INT NOT NULL DEFAULT 1 COMMENT 'Día del mes en que se genera (1-28)',
    activo BOOLEAN DEFAULT TRUE,
    ultimo_procesado DATE NULL COMMENT 'Última fecha en que se generó la transacción',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_activo (activo),
    INDEX idx_dia_mes (dia_mes),
    INDEX idx_categoria (categoria_id),
    CONSTRAINT chk_dia_mes CHECK (dia_mes BETWEEN 1 AND 28)
);

-- Insertar algunos gastos recurrentes de ejemplo
INSERT IGNORE INTO gastos_recurrentes (descripcion, monto, tipo, categoria_id, dia_mes, activo) VALUES
('Alquiler', 800.00, 'egreso', (SELECT id FROM categorias WHERE nombre = 'Hogar' LIMIT 1), 1, TRUE),
('Internet', 45.00, 'egreso', (SELECT id FROM categorias WHERE nombre = 'Servicios' LIMIT 1), 5, TRUE),
('Seguro médico', 120.00, 'egreso', (SELECT id FROM categorias WHERE nombre = 'Seguros' LIMIT 1), 10, TRUE),
('Salario', 2500.00, 'ingreso', (SELECT id FROM categorias WHERE nombre = 'Salario' LIMIT 1), 28, TRUE);

-- Insertar algunas transacciones de ejemplo (opcional)
INSERT IGNORE INTO transacciones (descripcion, monto, tipo, categoria_id, fecha) VALUES
('Salario mensual', 3000.00, 'ingreso', 1, CURDATE()),
('Supermercado', 150.50, 'egreso', 6, CURDATE()),
('Transporte público', 45.00, 'egreso', 7, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('Cena en restaurante', 80.00, 'egreso', 9, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
('Freelance proyecto', 500.00, 'ingreso', 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY));

-- Crear vistas útiles para reportes
CREATE OR REPLACE VIEW vista_transacciones_completas AS
SELECT 
    t.id,
    t.descripcion,
    t.monto,
    t.tipo,
    t.fecha,
    t.created_at,
    t.updated_at,
    c.nombre as categoria_nombre,
    c.color as categoria_color
FROM transacciones t
JOIN categorias c ON t.categoria_id = c.id
ORDER BY t.fecha DESC, t.created_at DESC;

CREATE OR REPLACE VIEW vista_resumen_mensual AS
SELECT 
    YEAR(fecha) as ano,
    MONTH(fecha) as mes,
    tipo,
    COUNT(*) as cantidad_transacciones,
    SUM(monto) as total_monto,
    AVG(monto) as promedio_monto
FROM transacciones
GROUP BY YEAR(fecha), MONTH(fecha), tipo
ORDER BY ano DESC, mes DESC, tipo;

CREATE OR REPLACE VIEW vista_resumen_categorias AS
SELECT 
    c.nombre as categoria,
    c.tipo,
    c.color,
    COUNT(t.id) as cantidad_transacciones,
    COALESCE(SUM(t.monto), 0) as total_monto,
    COALESCE(AVG(t.monto), 0) as promedio_monto
FROM categorias c
LEFT JOIN transacciones t ON c.id = t.categoria_id
GROUP BY c.id, c.nombre, c.tipo, c.color
ORDER BY total_monto DESC;