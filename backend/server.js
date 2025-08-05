const express = require('express');
const mysql = require('mysql2');
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

// Configuración de base de datos (MySQL local y PostgreSQL para producción)
let db;

if (process.env.DATABASE_URL) {
  // PostgreSQL para producción (Render)
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  // MySQL para desarrollo local
  db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gastos_personales',
    port: process.env.DB_PORT || 3306,
    authPlugins: {
      mysql_native_password: () => require('mysql2/lib/auth_plugins').mysql_native_password
    }
  });
}

// Función para ejecutar queries que funciona con ambas bases de datos
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (process.env.DATABASE_URL) {
      // PostgreSQL
      db.query(query, params, (err, result) => {
        if (err) {
          console.error('PostgreSQL Error:', err);
          reject(err);
        } else {
          resolve(result.rows || result);
        }
      });
    } else {
      // MySQL
      db.query(query, params, (err, result) => {
        if (err) {
          console.error('MySQL Error:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    }
  });
};

// Conectar a la base de datos
if (process.env.DATABASE_URL) {
  // PostgreSQL - no necesita conexión explícita
  console.log('Usando PostgreSQL (Render)');
} else {
  // MySQL
  db.connect((err) => {
    if (err) {
      console.error('Error conectando a la base de datos:', err);
      return;
    }
    console.log('Conectado a la base de datos MySQL');
  });
}

// Crear tablas si no existen
const createTables = async () => {
  try {
    if (process.env.DATABASE_URL) {
      // PostgreSQL queries
      const categoriesTable = `
        CREATE TABLE IF NOT EXISTS categorias (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL UNIQUE,
          tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
          color VARCHAR(7) DEFAULT '#3498db',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

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

      // Insertar categorías por defecto para PostgreSQL
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

    } else {
      // MySQL queries (original)
      const categoriesTable = `
        CREATE TABLE IF NOT EXISTS categorias (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL UNIQUE,
          tipo ENUM('ingreso', 'egreso') NOT NULL,
          color VARCHAR(7) DEFAULT '#3498db',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const transactionsTable = `
        CREATE TABLE IF NOT EXISTS transacciones (
          id INT AUTO_INCREMENT PRIMARY KEY,
          descripcion VARCHAR(255) NOT NULL,
          monto DECIMAL(10,2) NOT NULL,
          tipo ENUM('ingreso', 'egreso') NOT NULL,
          categoria_id INT,
          fecha DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        )
      `;

      const recurringExpensesTable = `
        CREATE TABLE IF NOT EXISTS gastos_recurrentes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          descripcion VARCHAR(255) NOT NULL,
          monto DECIMAL(10,2) NOT NULL,
          tipo ENUM('ingreso', 'egreso') NOT NULL,
          categoria_id INT,
          dia_mes INT NOT NULL DEFAULT 1,
          activo BOOLEAN DEFAULT TRUE,
          ultimo_procesado DATE NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (categoria_id) REFERENCES categorias(id),
          CONSTRAINT chk_dia_mes CHECK (dia_mes BETWEEN 1 AND 28)
        )
      `;

      await executeQuery(categoriesTable);
      await executeQuery(transactionsTable);
      await executeQuery(recurringExpensesTable);

      // Insertar categorías por defecto para MySQL
      const defaultCategories = [
        ['Salario', 'ingreso', '#27ae60'],
        ['Freelance', 'ingreso', '#2ecc71'],
        ['Inversiones', 'ingreso', '#16a085'],
        ['Alimentos', 'egreso', '#e74c3c'],
        ['Transporte', 'egreso', '#f39c12'],
        ['Entretenimiento', 'egreso', '#9b59b6'],
        ['Salud', 'egreso', '#e67e22'],
        ['Educación', 'egreso', '#3498db'],
        ['Servicios', 'egreso', '#34495e'],
        ['Compras', 'egreso', '#95a5a6']
      ];

      const insertDefault = `INSERT IGNORE INTO categorias (nombre, tipo, color) VALUES ?`;
      await executeQuery(insertDefault, [defaultCategories]);
    }
    
    console.log('Tablas creadas y datos iniciales insertados');
  } catch (err) {
    console.error('Error creando tablas:', err);
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
app.post('/api/categorias', (req, res) => {
  const { nombre, tipo, color } = req.body;
  const query = 'INSERT INTO categorias (nombre, tipo, color) VALUES (?, ?, ?)';
  
  db.query(query, [nombre, tipo, color || '#3498db'], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, nombre, tipo, color });
  });
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
      if (process.env.DATABASE_URL) {
        query += ` AND t.fecha >= $${paramIndex}`;
      } else {
        query += ' AND t.fecha >= ?';
      }
      params.push(fechaInicio);
      paramIndex++;
    }
    
    if (fechaFin) {
      if (process.env.DATABASE_URL) {
        query += ` AND t.fecha <= $${paramIndex}`;
      } else {
        query += ' AND t.fecha <= ?';
      }
      params.push(fechaFin);
      paramIndex++;
    }
    
    if (tipo) {
      if (process.env.DATABASE_URL) {
        query += ` AND t.tipo = $${paramIndex}`;
      } else {
        query += ' AND t.tipo = ?';
      }
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
app.post('/api/transacciones', (req, res) => {
  const { descripcion, monto, tipo, categoria_id, fecha } = req.body;
  const query = 'INSERT INTO transacciones (descripcion, monto, tipo, categoria_id, fecha) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [descripcion, monto, tipo, categoria_id, fecha], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, descripcion, monto, tipo, categoria_id, fecha });
  });
});

// Actualizar transacción
app.put('/api/transacciones/:id', (req, res) => {
  const { id } = req.params;
  const { descripcion, monto, tipo, categoria_id, fecha } = req.body;
  const query = 'UPDATE transacciones SET descripcion = ?, monto = ?, tipo = ?, categoria_id = ?, fecha = ? WHERE id = ?';
  
  db.query(query, [descripcion, monto, tipo, categoria_id, fecha, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json({ message: 'Transacción actualizada exitosamente' });
  });
});


// Eliminar transacción
app.delete('/api/transacciones/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM transacciones WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json({ message: 'Transacción eliminada exitosamente' });
  });
});

// Actualizar categoría
app.put('/api/categorias/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, color } = req.body;
  const query = 'UPDATE categorias SET nombre = ?, tipo = ?, color = ? WHERE id = ?';
  
  db.query(query, [nombre, tipo, color, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría actualizada exitosamente' });
  });
});

// Eliminar categoría
app.delete('/api/categorias/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM categorias WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría eliminada exitosamente' });
  });
});


// Obtener resumen de gastos por categoría
app.get('/api/resumen/categorias', (req, res) => {
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
  
  if (fechaInicio) {
    query += ' AND t.fecha >= ?';
    params.push(fechaInicio);
  }
  
  if (fechaFin) {
    query += ' AND t.fecha <= ?';
    params.push(fechaFin);
  }
  
  query += ' GROUP BY c.id, c.nombre, c.color, t.tipo ORDER BY total DESC';
  
  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Obtener resumen mensual
app.get('/api/resumen/mensual', (req, res) => {
  const { ano } = req.query;
  
  let query = `
    SELECT 
      MONTH(fecha) as mes,
      YEAR(fecha) as ano,
      tipo,
      SUM(monto) as total
    FROM transacciones
    WHERE 1=1
  `;
  
  const params = [];
  
  if (ano) {
    query += ' AND YEAR(fecha) = ?';
    params.push(ano);
  }
  
  query += ' GROUP BY YEAR(fecha), MONTH(fecha), tipo ORDER BY ano DESC, mes DESC';
  
  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// RUTAS PARA GASTOS RECURRENTES

// Obtener todos los gastos recurrentes
app.get('/api/gastos-recurrentes', (req, res) => {
  const query = `
    SELECT gr.*, c.nombre as categoria_nombre, c.color as categoria_color
    FROM gastos_recurrentes gr
    JOIN categorias c ON gr.categoria_id = c.id
    ORDER BY gr.activo DESC, gr.dia_mes ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Crear nuevo gasto recurrente
app.post('/api/gastos-recurrentes', (req, res) => {
  const { descripcion, monto, tipo, categoria_id, dia_mes, activo = true } = req.body;
  const query = 'INSERT INTO gastos_recurrentes (descripcion, monto, tipo, categoria_id, dia_mes, activo) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [descripcion, monto, tipo, categoria_id, dia_mes, activo], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      id: result.insertId, 
      descripcion, 
      monto, 
      tipo, 
      categoria_id, 
      dia_mes, 
      activo 
    });
  });
});

// Actualizar gasto recurrente
app.put('/api/gastos-recurrentes/:id', (req, res) => {
  const { id } = req.params;
  const { descripcion, monto, tipo, categoria_id, dia_mes, activo } = req.body;
  const query = 'UPDATE gastos_recurrentes SET descripcion = ?, monto = ?, tipo = ?, categoria_id = ?, dia_mes = ?, activo = ? WHERE id = ?';
  
  db.query(query, [descripcion, monto, tipo, categoria_id, dia_mes, activo, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Gasto recurrente no encontrado' });
    }
    res.json({ message: 'Gasto recurrente actualizado exitosamente' });
  });
});

// Eliminar gasto recurrente
app.delete('/api/gastos-recurrentes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM gastos_recurrentes WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Gasto recurrente no encontrado' });
    }
    res.json({ message: 'Gasto recurrente eliminado exitosamente' });
  });
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