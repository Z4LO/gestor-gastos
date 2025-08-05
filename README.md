# 💰 Sistema de Gestión de Gastos Personales

Sistema completo para administrar ingresos y egresos personales con interfaz web moderna.

## 🚀 Características

- ✅ **Dashboard Interactivo**: Visualización de balances y gráficos
- ✅ **Gestión de Transacciones**: Agregar, editar y eliminar ingresos/gastos
- ✅ **Categorías Personalizables**: Organiza tus gastos por categorías
- ✅ **Gastos Recurrentes**: Automatiza gastos mensuales repetitivos
- ✅ **Filtros por Fecha**: Analiza períodos específicos
- ✅ **Modo Oscuro/Claro**: Tema personalizable
- ✅ **Responsive**: Funciona en móviles y tablets

## 🛠️ Tecnologías

**Frontend:**
- ⚛️ React 18
- 📊 Chart.js para gráficos
- 🎨 CSS personalizado con tema dark/light
- 📅 DatePicker para filtros

**Backend:**
- 🟢 Node.js + Express
- 🗄️ MySQL (local)
- 🔄 CORS habilitado
- ⏰ Cron jobs para gastos recurrentes

## 📦 Instalación

### Prerequisitos
- ✅ Node.js (v16 o superior)
- ✅ MySQL Server (XAMPP recomendado)
- ✅ Git

### 1. Clonar Repositorio
```bash
git clone <tu-repositorio>
cd gestor-gastos
```

### 2. Instalar Dependencias
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurar Base de Datos
1. **Iniciar MySQL** (XAMPP o servidor local)
2. **Crear base de datos:**
   ```sql
   CREATE DATABASE gastos_personales;
   ```
3. **Configurar credenciales** (opcional):
   - Crear `backend/.env` con tus credenciales MySQL

### 4. Ejecutar Sistema
```bash
# Opción A: Script automático
iniciar_gastos.bat

# Opción B: Manual
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)  
cd frontend
npm start
```

### 5. Acceder a la Aplicación
```bash
🌐 Frontend: http://localhost:3000
🔧 Backend: http://localhost:3001
```

## 📋 Uso del Sistema

### **Dashboard**
- 📊 Visualiza balance general (ingresos - gastos)
- 📈 Gráficos por categorías 
- 📅 Filtros por período

### **Transacciones**
- ➕ **Agregar**: Click "Nueva Transacción"
- ✏️ **Editar**: Click en una transacción existente
- 🗑️ **Eliminar**: Botón rojo en cada transacción

### **Categorías**
- 🏷️ **Gestionar**: Pestaña "Categorías"
- 🎨 **Personalizar**: Cambiar colores y nombres
- ➕ **Crear**: Nuevas categorías de ingreso/egreso

### **Gastos Recurrentes**
- 🔄 **Automatizar**: Gastos que se repiten mensualmente
- 📅 **Configurar**: Día del mes para procesamiento
- ⏰ **Auto-procesamiento**: Diario a las 9:00 AM

## 🗂️ Estructura del Proyecto

```
gestor-gastos/
├── backend/                 # API Node.js
│   ├── server.js           # Servidor principal
│   ├── package.json        # Dependencias backend
│   └── .env.example        # Variables de entorno
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Context API (Theme)
│   │   └── styles/         # CSS personalizado
│   └── package.json        # Dependencias frontend
├── database_schema.sql     # Schema MySQL
├── iniciar_gastos.bat     # Script de inicio Windows
├── cerrar_gastos.bat      # Script de cierre
└── README.md              # Esta documentación
```

## 🔧 Scripts Disponibles

### **Windows (Batch)**
```bash
iniciar_gastos.bat         # Iniciar sistema completo
cerrar_gastos.bat          # Cerrar todos los procesos
```

### **NPM Scripts**
```bash
# Backend
npm start                  # Producción
npm run dev               # Desarrollo (nodemon)

# Frontend  
npm start                 # Servidor desarrollo
npm run build             # Build producción
```

## ⚙️ Configuración

### **Variables de Entorno (Backend)**
Crear `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gastos_personales
DB_PORT=3306
```

### **Configuración MySQL**
- **Usuario**: root (por defecto)
- **Password**: vacío (XAMPP) o tu password
- **Puerto**: 3306
- **Base**: gastos_personales

## 🚨 Troubleshooting

### **Error: "Cannot connect to MySQL"**
```bash
# Verificar que MySQL esté corriendo
net start mysql            # Windows
sudo service mysql start   # Linux/Mac

# Verificar credenciales en backend/.env
```

### **Error: "Port 3000/3001 already in use"**
```bash
# Terminar procesos existentes
cerrar_gastos.bat

# O manualmente
taskkill /f /im node.exe
```

### **Frontend no carga datos**
```bash
# Verificar que backend esté corriendo
curl http://localhost:3001/api/categorias

# Verificar CORS en browser dev tools
```

## 📈 Próximas Mejoras

- [ ] 📊 Más tipos de gráficos
- [ ] 📱 PWA para instalación móvil  
- [ ] 💾 Backup/Restore de datos
- [ ] 📧 Notificaciones por email
- [ ] 🔐 Sistema de usuarios

## 📄 Licencia

Proyecto personal de código abierto. Libre para usar y modificar.

---

**¿Necesitas ayuda?** Revisa la sección de troubleshooting o abre un issue en el repositorio.