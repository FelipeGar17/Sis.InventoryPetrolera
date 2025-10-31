# 📝 Sistema de Reportes - Guía de Prueba

## 🎯 Funcionalidad Implementada

### 1️⃣ **Dashboard del Operario** (`/dashboard/operario`)
- ✅ Vista de **solo lectura** del inventario completo
- ✅ Botón **"Reportar"** (📝) en cada equipo
- ✅ Modal para crear reportes con:
  - Tipo de reporte (Falla, Mantenimiento, Observación, Solicitud)
  - Mensaje detallado del problema
- ✅ Sección "Mis Reportes" con historial propio

### 2️⃣ **Dashboard del Admin** (`/dashboard`)
- ✅ Sección "Notas" con DataTable de todos los reportes
- ✅ Filtro por estado (Pendiente, En Revisión, Resuelto, Cerrado)
- ✅ Modal para gestionar cada reporte:
  - Ver toda la información del reporte
  - Cambiar estado
  - Agregar respuesta/acción tomada
  - Eliminar reporte

---

## 🧪 Pasos para Probar

### **Paso 1: Crear un Operario**
1. Inicia sesión como **admin** (`admin` / `admin123`)
2. Ve a la sección **"Operarios"**
3. Click en **"➕ Nuevo Operario"**
4. Llena los datos:
   - Username: `operario1`
   - Email: `operario1@petrolera.com`
   - Nombre Completo: `Juan Pérez`
   - Contraseña: `operario123`
   - Rol: Operario (único disponible)
5. Click en **"Guardar Usuario"**

### **Paso 2: Iniciar Sesión como Operario**
1. Cierra sesión del admin
2. Inicia sesión con: `operario1` / `operario123`
3. Serás redirigido automáticamente a `/dashboard/operario`

### **Paso 3: Crear un Reporte**
1. En el dashboard del operario, verás la tabla de inventario
2. Busca cualquier equipo (ej: `MAQ-001`)
3. Click en el botón **📝** (Reportar)
4. Llena el formulario:
   - **Tipo**: Selecciona "🔴 Falla / Avería"
   - **Descripción**: "La bomba hace ruido extraño y vibra excesivamente. Detectado durante inspección de rutina a las 10:00 AM."
5. Click en **"📤 Enviar Reporte"**
6. Deberías ver: **"✅ Reporte enviado correctamente"**

### **Paso 4: Ver Reportes como Operario**
1. Click en **"Mis Reportes"** en el sidebar
2. Verás una tabla con todos tus reportes enviados:
   - Fecha y hora
   - Equipo reportado
   - Tipo de reporte
   - Estado (Pendiente/En Revisión/Resuelto/Cerrado)

### **Paso 5: Gestionar Reportes como Admin**
1. Cierra sesión del operario
2. Inicia sesión como **admin** (`admin` / `admin123`)
3. Ve a la sección **"Notas"** en el sidebar
4. Verás todos los reportes de todos los operarios
5. Click en **🔧** (Gestionar) en el reporte que creaste
6. En el modal, verás:
   - Equipo reportado
   - Operario que reportó
   - Fecha del reporte
   - Tipo y mensaje completo
7. Cambia el estado a **"🔍 En Revisión"**
8. Agrega una respuesta: "Revisión programada para mañana 8:00 AM. Se solicitaron repuestos."
9. Click en **"💾 Actualizar Reporte"**
10. El reporte ahora aparece con el nuevo estado

### **Paso 6: Verificar Respuesta como Operario**
1. Cierra sesión del admin
2. Inicia sesión como **operario1**
3. Ve a **"Mis Reportes"**
4. Verás que el estado cambió a **"En Revisión"**
5. (Nota: la respuesta del admin se puede ver en la tabla o en una vista detallada)

---

## 🔄 Flujo Completo del Sistema

```
1. OPERARIO detecta problema → 📝 Crea reporte
   ↓
2. Sistema guarda reporte con estado PENDIENTE
   ↓
3. ADMIN recibe notificación (en sección Notas)
   ↓
4. ADMIN revisa reporte → Cambia estado a EN_REVISION
   ↓
5. ADMIN toma acción → Cambia a RESUELTO + agrega respuesta
   ↓
6. OPERARIO ve actualización en "Mis Reportes"
   ↓
7. Ciclo completo → Estado final: CERRADO
```

---

## 📊 Estados de Reportes

| Estado | Icono | Significado |
|--------|-------|-------------|
| `PENDIENTE` | ⏱️ | Reporte nuevo, sin revisar |
| `EN_REVISION` | 🔍 | Admin está revisando/trabajando |
| `RESUELTO` | ✅ | Problema solucionado |
| `CERRADO` | 🔒 | Caso cerrado definitivamente |

## 🎨 Tipos de Reportes

| Tipo | Icono | Cuándo usarlo |
|------|-------|---------------|
| `FALLA` | 🔴 | Equipo no funciona o averiado |
| `MANTENIMIENTO` | 🟡 | Requiere mantenimiento preventivo |
| `OBSERVACION` | 🔵 | Nota general o sugerencia |
| `SOLICITUD` | 🟢 | Solicitud de revisión técnica |

---

## 🗂️ Archivos Creados/Modificados

### **Backend:**
- ✅ `backend/models/report.py` - Modelo de datos
- ✅ `backend/routes/report_routes.py` - API de reportes
- ✅ `backend/config/database.py` - Import del modelo
- ✅ `backend/app.py` - Registro del blueprint

### **Frontend - Operario:**
- ✅ `frontend/templates/operario/dashboard.html` - Vista del operario
- ✅ `frontend/static/js/dashboard-operario.js` - Lógica del operario

### **Frontend - Admin:**
- ✅ `frontend/templates/admin/dashboard.html` - Sección de notas + modal
- ✅ `frontend/static/js/reports-management.js` - Gestión de reportes
- ✅ `frontend/static/js/dashboard-admin.js` - Navegación actualizada

### **Frontend - Compartido:**
- ✅ `frontend/static/js/api.js` - Métodos de API para reportes
- ✅ `frontend/static/css/global.css` - Estilos de botones
- ✅ `frontend/templates/login.html` - Redirección según rol

### **Rutas:**
- ✅ `backend/routes/main_routes.py` - Ruta `/dashboard/operario`

---

## 🔐 Credenciales de Prueba

| Usuario | Password | Rol | Dashboard |
|---------|----------|-----|-----------|
| `admin` | `admin123` | ADMIN | `/dashboard` |
| `operario1` | `operario123` | USER | `/dashboard/operario` |

---

## ✅ Checklist de Testing

- [ ] Crear operario desde admin
- [ ] Login como operario → Redirección correcta
- [ ] Ver inventario (solo lectura)
- [ ] Crear reporte de falla
- [ ] Ver "Mis Reportes"
- [ ] Login como admin
- [ ] Ver sección "Notas" con el reporte
- [ ] Filtrar por estado
- [ ] Gestionar reporte (cambiar estado + respuesta)
- [ ] Volver como operario y verificar cambio
- [ ] Eliminar reporte como admin

---

## 🐛 Troubleshooting

### Error: "DataTables Ajax error"
- Verifica que el servidor Flask esté corriendo
- Revisa que el token JWT no haya expirado (24h)
- Comprueba la consola del navegador (F12)

### No aparece botón "Reportar"
- Verifica que el archivo `dashboard-operario.js` esté cargado
- Comprueba que las rutas de API estén correctas

### Operario no puede crear reporte
- Verifica que el token esté en localStorage como `access_token`
- Comprueba que el rol sea `USER` en el token

---

## 🎉 ¡Listo para Producción!

El sistema completo de reportes ya está funcional. Ahora los operarios pueden reportar problemas y el admin puede gestionarlos eficientemente.

**Próximos pasos sugeridos:**
1. Notificaciones en tiempo real (WebSockets)
2. Dashboard de estadísticas
3. Exportar reportes a PDF/Excel
4. Sistema de prioridades (ALTA/MEDIA/BAJA)
5. Adjuntar fotos a los reportes

