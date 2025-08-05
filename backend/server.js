const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gastos-frontend-7362.onrender.com'] 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configuración de base de datos PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/gastos_personales',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Función para ejecutar queries PostgreSQL
const executeQuery = async (query, params = []) => {
  try {
    const result = await db.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('PostgreSQL Error:', err);
    throw err;
  }
};

console.log('Usando PostgreSQL');

// Crear tablas si no existen (PostgreSQL)
const createTables = async () => {
  try {
    // Crear tabla categorias
    const categoriesTable = `
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
        color VARCHAR(7) DEFAULT '#3498db',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear tabla transacciones
    const transactionsTable = `
      CREATE TABLE IF NOT EXISTS transacciones (
        id SERIAL PRIMARY KEY,
        descripcion VARCHAR(255) NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
        categoria_id INTEGER REFERENCES categorias(id),
        fecha DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear tabla gastos_recurrentes
    const recurringExpensesTable = `
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
      )
    `;

    await executeQuery(categoriesTable);
    await executeQuery(transactionsTable);
    await executeQuery(recurringExpensesTable);

    // Insertar categorías por defecto
    const insertDefault = `
      INSERT INTO categorias (nombre, tipo, color) VALUES 
      ($1, $2, $3), ($4, $5, $6), ($7, $8, $9), ($10, $11, $12), ($13, $14, $15),
      ($16, $17, $18), ($19, $20, $21), ($22, $23, $24), ($25, $26, $27), ($28, $29, $30)
      ON CONFLICT (nombre) DO NOTHING
    `;
    
    await executeQuery(insertDefault, [
      'Salario', 'ingreso', '#27ae60',
      'Freelance', 'ingreso', '#2ecc71',
      'Inversiones', 'ingreso', '#16a085',
      'Alimentos', 'egreso', '#e74c3c',
      'Transporte', 'egreso', '#f39c12',
      'Entretenimiento', 'egreso', '#9b59b6',
      'Salud', 'egreso', '#e67e22',
      'Educación', 'egreso', '#3498db',
      'Servicios', 'egreso', '#34495e',
      'Compras', 'egreso', '#95a5a6'
    ]);
    
    console.log('Tablas PostgreSQL creadas y datos iniciales insertados');
  } catch (err) {
    console.error('Error creando tablas PostgreSQL:', err);
  }
};

createTables();

// RUTAS DE LA API

// Obtener todas las categorías
app.get('/api/categorias', async (req, res) => {
  try {
    const query = 'SELECT * FROM categorias ORDER BY tipo, nombre';
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    console.error('Error en GET /api/categorias:', err);
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva categoría
app.post('/api/categorias', async (req, res) => {
  try {
    const { nombre, tipo, color } = req.body;
    const query = 'INSERT INTO categorias (nombre, tipo, color) VALUES ($1, $2, $3) RETURNING id';
    const result = await executeQuery(query, [nombre, tipo, color || '#3498db']);
    
    res.json({ id: result[0].id, nombre, tipo, color: color || '#3498db' });
  } catch (err) {
    console.error('Error en POST /api/categorias:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las transacciones
app.get('/api/transacciones', async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo } = req.query;
    
    let query = `
      SELECT t.*, c.nombre as categoria_nombre, c.color as categoria_color
      FROM transacciones t
      JOIN categorias c ON t.categoria_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (fechaInicio) {
      query += ` AND t.fecha >= $${paramIndex}`;
      params.push(fechaInicio);
      paramIndex++;
    }
    
    if (fechaFin) {
      query += ` AND t.fecha <= $${paramIndex}`;
      params.push(fechaFin);
      paramIndex++;
    }
    
    if (tipo) {
      query += ` AND t.tipo = $${paramIndex}`;
      params.push(tipo);
    }
    
    query += ' ORDER BY t.fecha DESC, t.created_at DESC';
    
    const results = await executeQuery(query, params);
    res.json(results);
  } catch (err) {
    console.error('Error en GET /api/transacciones:', err);
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva transacción
app.post('/api/transacciones', async (req, res) => {
  try {
    const { descripcion, monto, tipo, categoria_id, fecha } = req.body;
    const query = 'INSERT INTO transacciones (descripcion, monto, tipo, categoria_id, fecha) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const result = await executeQuery(query, [descripcion, monto, tipo, categoria_id, fecha]);
    
    res.json({ id: result[0].id, descripcion, monto, tipo, categoria_id, fecha });
  } catch (err) {
    console.error('Error en POST /api/transacciones:', err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar transacción
app.put('/api/transacciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, monto, tipo, categoria_id, fecha } = req.body;
    const query = 'UPDATE transacciones SET descripcion = $1, monto = $2, tipo = $3, categoria_id = $4, fecha = $5 WHERE id = $6';
    const result = await db.query(query, [descripcion, monto, tipo, categoria_id, fecha, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json({ message: 'Transacción actualizada exitosamente' });
  } catch (err) {
    console.error('Error en PUT /api/transacciones/:id:', err);
    res.status(500).json({ error: err.message });
  }
});


// Eliminar transacción
app.delete('/api/transacciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM transacciones WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json({ message: 'Transacción eliminada exitosamente' });
  } catch (err) {
    console.error('Error en DELETE /api/transacciones/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar categoría
app.put('/api/categorias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, color } = req.body;
    const query = 'UPDATE categorias SET nombre = $1, tipo = $2, color = $3 WHERE id = $4';
    const result = await db.query(query, [nombre, tipo, color, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría actualizada exitosamente' });
  } catch (err) {
    console.error('Error en PUT /api/categorias/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar categoría
app.delete('/api/categorias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM categorias WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (err) {
    console.error('Error en DELETE /api/categorias/:id:', err);
    res.status(500).json({ error: err.message });
  }
});


// Obtener resumen de gastos por categoría
app.get('/api/resumen/categorias', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    let query = `
      SELECT 
        c.nombre,
        c.color,
        t.tipo,
        SUM(t.monto) as total,
        COUNT(t.id) as cantidad
      FROM transacciones t
      JOIN categorias c ON t.categoria_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (fechaInicio) {
      query += ` AND t.fecha >= $${paramIndex}`;
      params.push(fechaInicio);
      paramIndex++;
    }
    
    if (fechaFin) {
      query += ` AND t.fecha <= $${paramIndex}`;
      params.push(fechaFin);
    }
    
    query += ' GROUP BY c.id, c.nombre, c.color, t.tipo ORDER BY total DESC';
    
    const results = await executeQuery(query, params);
    res.json(results);
  } catch (err) {
    console.error('Error en GET /api/resumen/categorias:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener resumen mensual
app.get('/api/resumen/mensual', async (req, res) => {
  try {
    const { ano } = req.query;
    
    let query = `
      SELECT 
        EXTRACT(MONTH FROM fecha) as mes,
        EXTRACT(YEAR FROM fecha) as ano,
        tipo,
        SUM(monto) as total
      FROM transacciones
      WHERE 1=1
    `;
    
    const params = [];
    
    if (ano) {
      query += ' AND EXTRACT(YEAR FROM fecha) = $1';
      params.push(ano);
    }
    
    query += ' GROUP BY EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha), tipo ORDER BY ano DESC, mes DESC';
    
    const results = await executeQuery(query, params);
    res.json(results);
  } catch (err) {
    console.error('Error en GET /api/resumen/mensual:', err);
    res.status(500).json({ error: err.message });
  }
});

// RUTAS PARA GASTOS RECURRENTES

// Obtener todos los gastos recurrentes
app.get('/api/gastos-recurrentes', async (req, res) => {
  try {
    const query = `
      SELECT gr.*, c.nombre as categoria_nombre, c.color as categoria_color
      FROM gastos_recurrentes gr
      JOIN categorias c ON gr.categoria_id = c.id
      ORDER BY gr.activo DESC, gr.dia_mes ASC
    `;
    
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    console.error('Error en GET /api/gastos-recurrentes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo gasto recurrente
app.post('/api/gastos-recurrentes', async (req, res) => {
  try {
    const { descripcion, monto, tipo, categoria_id, dia_mes, activo = true } = req.body;
    const query = 'INSERT INTO gastos_recurrentes (descripcion, monto, tipo, categoria_id, dia_mes, activo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
    const result = await executeQuery(query, [descripcion, monto, tipo, categoria_id, dia_mes, activo]);
    
    res.json({ 
      id: result[0].id, 
      descripcion, 
      monto, 
      tipo, 
      categoria_id, 
      dia_mes, 
      activo 
    });
  } catch (err) {
    console.error('Error en POST /api/gastos-recurrentes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar gasto recurrente
app.put('/api/gastos-recurrentes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, monto, tipo, categoria_id, dia_mes, activo } = req.body;
    const query = 'UPDATE gastos_recurrentes SET descripcion = $1, monto = $2, tipo = $3, categoria_id = $4, dia_mes = $5, activo = $6 WHERE id = $7';
    const result = await db.query(query, [descripcion, monto, tipo, categoria_id, dia_mes, activo, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Gasto recurrente no encontrado' });
    }
    res.json({ message: 'Gasto recurrente actualizado exitosamente' });
  } catch (err) {
    console.error('Error en PUT /api/gastos-recurrentes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar gasto recurrente
app.delete('/api/gastos-recurrentes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM gastos_recurrentes WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Gasto recurrente no encontrado' });
    }
    res.json({ message: 'Gasto recurrente eliminado exitosamente' });
  } catch (err) {
    console.error('Error en DELETE /api/gastos-recurrentes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// Función para procesar gastos recurrentes automáticamente
const procesarGastosRecurrentes = () => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  console.log(`Procesando gastos recurrentes para el día ${currentDay}...`);
  
  // Obtener gastos recurrentes que deben procesarse hoy
  const query = `
    SELECT * FROM gastos_recurrentes 
    WHERE activo = TRUE 
    AND dia_mes = ?
    AND (ultimo_procesado IS NULL 
         OR ultimo_procesado < LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)))
  `;
  
  db.query(query, [currentDay], (err, gastosRecurrentes) => {
    if (err) {
      console.error('Error obteniendo gastos recurrentes:', err);
      return;
    }
    
    gastosRecurrentes.forEach(gasto => {
      // Crear la transacción
      const insertQuery = 'INSERT INTO transacciones (descripcion, monto, tipo, categoria_id, fecha) VALUES (?, ?, ?, ?, ?)';
      const fechaTransaccion = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
      
      db.query(insertQuery, [
        `${gasto.descripcion} (Automático)`,
        gasto.monto,
        gasto.tipo,
        gasto.categoria_id,
        fechaTransaccion
      ], (insertErr, result) => {
        if (insertErr) {
          console.error(`Error creando transacción automática para ${gasto.descripcion}:`, insertErr);
          return;
        }
        
        // Actualizar fecha de último procesado
        const updateQuery = 'UPDATE gastos_recurrentes SET ultimo_procesado = CURDATE() WHERE id = ?';
        db.query(updateQuery, [gasto.id], (updateErr) => {
          if (updateErr) {
            console.error(`Error actualizando último procesado para ${gasto.descripcion}:`, updateErr);
          } else {
            console.log(`✓ Transacción automática creada: ${gasto.descripcion} - $${gasto.monto}`);
          }
        });
      });
    });
  });
};

// Endpoint manual para procesar gastos recurrentes (útil para testing)
app.post('/api/gastos-recurrentes/procesar', (req, res) => {
  procesarGastosRecurrentes();
  res.json({ message: 'Procesamiento de gastos recurrentes iniciado' });
});

// Ejecutar procesamiento automático cada día a las 9:00 AM
const cron = require('node-cron');

// Programar para que se ejecute todos los días a las 9:00 AM
cron.schedule('0 9 * * *', () => {
  procesarGastosRecurrentes();
}, {
  timezone: "America/Argentina/Buenos_Aires"
});

console.log('Cron job configurado para procesar gastos recurrentes diariamente a las 9:00 AM');

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});