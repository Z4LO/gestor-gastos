# 🐘 PostgreSQL Setup - Gestor de Gastos

Sistema actualizado para usar **solo PostgreSQL** tanto en desarrollo como en producción.

## 🚀 Configuración Local

### **Opción 1: PostgreSQL Local (Recomendado)**

#### 1. Instalar PostgreSQL
```bash
# Windows
# Descargar desde: https://www.postgresql.org/download/windows/

# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### 2. Configurar Base de Datos
```bash
# Conectar como superusuario
psql -U postgres

# Crear base de datos
CREATE DATABASE gastos_personales;

# Crear usuario (opcional)
CREATE USER gastos_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE gastos_personales TO gastos_user;

# Salir
\q
```

#### 3. Configurar Variables de Entorno
Crear `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/gastos_personales
PORT=3001
NODE_ENV=development
```

### **Opción 2: PostgreSQL con Docker**
```bash
# Ejecutar PostgreSQL en Docker
docker run --name postgres-gastos \
  -e POSTGRES_DB=gastos_personales \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Variable de entorno
DATABASE_URL=postgresql://postgres:password@localhost:5432/gastos_personales
```

### **Opción 3: PostgreSQL Online (Gratis)**

#### ElephantSQL (Gratis)
1. Ve a [elephantsql.com](https://www.elephantsql.com/)
2. Crear cuenta gratuita
3. Crear nueva instancia (Tiny Turtle - Free)
4. Copiar la URL de conexión

#### Supabase (Gratis)
1. Ve a [supabase.com](https://supabase.com/)
2. Crear proyecto
3. Ir a Settings → Database
4. Copiar Connection String

## 📋 Comandos Útiles

### **Iniciar Sistema**
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

### **Verificar Conexión PostgreSQL**
```bash
# Conectar desde terminal
psql "postgresql://postgres:password@localhost:5432/gastos_personales"

# Ver tablas
\dt

# Ver datos
SELECT * FROM categorias;
```

### **Scripts de Base de Datos**
```sql
-- Ver todas las tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver estructura de tabla
\d categorias

-- Backup
pg_dump gastos_personales > backup.sql

-- Restore
psql gastos_personales < backup.sql
```

## 🔧 Troubleshooting

### **Error: "database does not exist"**
```bash
createdb gastos_personales
```

### **Error: "role does not exist"**
```bash
psql -U postgres
CREATE USER tu_usuario WITH PASSWORD 'tu_password';
```

### **Error: "connection refused"**
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql start  # Linux
brew services start postgresql  # macOS
```

### **Error: "authentication failed"**
Verificar credenciales en `.env` y que coincidan con tu instalación PostgreSQL.

## 🌐 Producción (Render)

El sistema está configurado para usar automáticamente la variable `DATABASE_URL` de Render.

### Variables de Entorno en Render:
```
NODE_ENV=production
DATABASE_URL=[URL automática de Render PostgreSQL]
```

## 📊 Ventajas de PostgreSQL

- ✅ **Más potente** que MySQL
- ✅ **Mejor manejo de JSON**
- ✅ **Transacciones ACID**
- ✅ **Extensiones avanzadas**
- ✅ **Hosting gratuito** disponible
- ✅ **Compatible con Render**

## 🆘 Soporte

Si tienes problemas con PostgreSQL:
1. Verificar que el servicio esté corriendo
2. Comprobar credenciales en `.env`
3. Verificar que la base de datos exista
4. Revisar logs del backend para errores específicos