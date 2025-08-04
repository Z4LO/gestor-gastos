-- Schema para PostgreSQL (Render)
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  color VARCHAR(7) DEFAULT '#3498db',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transacciones (
  id SERIAL PRIMARY KEY,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  categoria_id INTEGER REFERENCES categorias(id),
  fecha DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gastos_recurrentes (
  id SERIAL PRIMARY KEY,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  categoria_id INTEGER REFERENCES categorias(id),
  dia_mes INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN DEFAULT TRUE,
  ultimo_procesado DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_dia_mes CHECK (dia_mes BETWEEN 1 AND 28)
);

-- Insertar categorías por defecto
INSERT INTO categorias (nombre, tipo, color) VALUES
  ('Salario', 'ingreso', '#27ae60'),
  ('Freelance', 'ingreso', '#2ecc71'),
  ('Inversiones', 'ingreso', '#16a085'),
  ('Alimentos', 'egreso', '#e74c3c'),
  ('Transporte', 'egreso', '#f39c12'),
  ('Entretenimiento', 'egreso', '#9b59b6'),
  ('Salud', 'egreso', '#e67e22'),
  ('Educación', 'egreso', '#3498db'),
  ('Servicios', 'egreso', '#34495e'),
  ('Compras', 'egreso', '#95a5a6')
ON CONFLICT (nombre) DO NOTHING;