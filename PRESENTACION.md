# Guión y Diapositivas para Exposición Final y Demostración en Vivo

**Asignatura:** Lenguaje Programación Web II  
**Evaluación 2:** Frontend, Consumo de API y Seguridad (UT2)  
**Proyecto:** Sistema de Gestión de Taller Mecánico  
**Estudiante:** Tomás  
**Docente:** Enso Guidotti  
**Tiempo Estimado:** 15 minutos  

---

## Estructura de la Presentación

```
[ Diapositiva 1: Portada y Contexto ]
               │
               ▼
[ Diapositiva 2: Arquitectura del Frontend y Consumo HTTP ]
               │
               ▼
[ Diapositiva 3: Flujo de Autenticación JWT y Almacenamiento ]
               │
               ▼
[ Diapositiva 4: Autorización por Roles y Rutas Protegidas ]
               │
               ▼
[ Diapositiva 5: Matriz de Seguridad OWASP ]
               │
               ▼
[ Diapositiva 6: Accesibilidad (WCAG 2.2 AA) y Diseño Responsivo ]
               │
               ▼
[ Diapositiva 7: Demostración en Vivo (Flujo Completo) ]
               │
               ▼
[ Diapositiva 8: Pruebas Automatizadas y Conclusiones ]
```

---

## Diapositiva 1: Portada y Contexto del Caso
* **Título:** Sistema de Gestión Integral para Taller Mecánico
* **Subtítulo:** Consumo de API RESTful con React, Autenticación JWT, Seguridad OWASP y Accesibilidad WCAG 2.2 AA.
* **Caso de Negocio:**
  * Plataforma integral para recepción de vehículos, diagnósticos mecánicos y seguimiento de órdenes de trabajo.
  * **Recurso principal:** `Órdenes de Trabajo` (CRUD completo).
  * **Recursos relacionados:** `Clientes`, `Vehículos`, `Mecánicos`, `Servicios` y `Repuestos`.
  * **Actores del sistema:** Administrador de Taller y Mecánico/Operador.

---

## Diapositiva 2: Arquitectura del Frontend y Capa de Consumo HTTP
* **Stack Tecnológico:**
  * **React 19 + TypeScript + Vite 8:** Alto rendimiento, compilación ágil y tipado estricto.
  * **TanStack React Query v5:** Gestión declarativa de estado del servidor, cache e invalidación automática tras mutaciones.
  * **React Hook Form + Zod:** Validación robusta en cliente campo a campo.
* **Cliente HTTP Centralizado (`apiClient.ts`):**
  * Base URL parametrizada por variable de entorno `VITE_API_URL`.
  * **Interceptor de Solicitud:** Inyecta automáticamente el token JWT como `Authorization: Bearer <token>`.
  * **Interceptor de Respuesta:** Normaliza errores y captura eventos críticos:
    * `401 Unauthorized`: Dispara cierre de sesión y redirección al login.
    * `403 Forbidden`: Normaliza el error de autorización de rol.
    * `429 Too Many Requests`: Alerta amigable al usuario sobre Rate Limiting de OWASP.

---

## Diapositiva 3: Flujo de Autenticación JWT y Justificación de Almacenamiento
* **Flujo de Credenciales:**
  1. Usuario envía `nombreUsuario` y `password` validados por Zod.
  2. Endpoint `/api/v1/usuarios/login` verifica hash con `PasswordHasher<Usuario>` (PBKDF2).
  3. API emite token JWT firmado con HMAC-SHA256, con expiración de 5 minutos y claims de identidad y rol.
* **Decisión de Almacenamiento (`sessionStorage`):**
  * Se eligió `sessionStorage` frente a `localStorage` porque se destruye automáticamente al cerrar la pestaña o el navegador, mitigando el robo de tokens persistentes.
  * A diferencia de cookies sin flag SameSite, el envío explícito como Bearer en encabezados HTTP previene completamente ataques de **CSRF**.
  * Verificación periódica activa cada 15 segundos: si el token expira, se ejecuta auto-logout protegiendo la sesión.

---

## Diapositiva 4: Autorización por Roles y Rutas Protegidas
* **Principio de Doble Validación (Cliente + Servidor):**
  * *La interfaz ayuda a guiar al usuario; el backend garantiza la seguridad.*
* **Roles del Sistema:**
  * **Administrador (`Admin`):** Acceso total. Puede listar, ver detalle, crear, editar y **eliminar** órdenes de trabajo.
  * **Mecánico (`Mecanico`):** Puede listar, ver detalle, crear y editar órdenes. **No tiene permiso para eliminar**.
* **Protección en Frontend (`ProtectedRoute.tsx`):**
  * Valida existencia y vigencia del JWT.
  * Si el rol es insuficiente, redirige a la página accesible de `403 - Acceso Denegado` (`AccessDeniedPage.tsx`).
* **Protección en Backend (`OrdenesTrabajoApi.cs`):**
  * El endpoint `DELETE /api/v1/ordenes-trabajo/{id}` posee `[Authorize(Roles = "Admin")]`.
  * Si un usuario con rol `Mecanico` fuerza una petición HTTP DELETE directa (ej. vía curl o Postman), el servidor responde **403 Forbidden**.

---

## Diapositiva 5: Seguridad de Extremo a Extremo (Matriz OWASP)
* **API2:2023 Autenticación Rota:** Expiración corta de 5 minutos, auto-logout en 401, token fuera de consola y URLs.
* **API5:2023 Autorización a Nivel de Función Rota:** Doble validación en cliente (botón eliminar bloqueado para mecánico) y backend (403 estricto).
* **OWASP Injection / XSS:** Ausencia total de `dangerouslySetInnerHTML`, renderizado seguro de React como texto plano, cabecera `X-XSS-Protection`.
* **API4:2023 Consumo Ilimitado de Recursos:** Rate Limiting estricto con política `LoginRateLimit` (10 peticiones/minuto) en login y 100 peticiones globales.
* **API8:2023 Configuración Insegura:** CORS con lista blanca explícita (`http://localhost:5173`), cabeceras HTTP (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).
* **Componentes Vulnerables:** `npm audit` ejecutado con **0 vulnerabilidades reportadas**.
* **Gestión de Secretos:** `.env.example` versionado sin secretos; ninguna llave privada expuesta en variables `VITE_*`.

---

## Diapositiva 6: Accesibilidad (WCAG 2.2 Nivel AA) y Diseño Responsivo
* **Accesibilidad:**
  * **HTML Semántico:** `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<table>` con `<caption>`.
  * **Formularios Accesibles:** Etiquetas vinculadas (`<label htmlFor>`), errores asociados con `aria-describedby` y leídos por lectores de pantalla con `aria-live="polite"`.
  * **Navegación 100% por Teclado:** Enlace *Skip to content* (`.skip-link`), indicador de foco visible (`:focus-visible` de 3px), trampa de foco en diálogos modales y tecla `Escape` para cerrar.
  * **Contraste de Color:** Superior a 4.5:1 en todos los textos.
  * **No dependencia del color:** Estados con color + iconos SVG + texto explicativo.
* **Diseño Responsivo Mobile-First:**
  * Compatible desde 320 px de ancho de pantalla hasta pantallas 4K.
  * En pantallas móviles (< 768 px), la tabla se transforma fluidamente en tarjetas individuales (*mobile cards*), sin generar scroll horizontal.
  * Objetivos táctiles mínimos de **44 × 44 px** en todos los botones y selectores.
  * Soporte de zoom de navegador hasta el 200% sin pérdida de funcionalidad.

---

## Diapositiva 7: Guión de la Demostración en Vivo (Live Demo)

### Paso 1: Intento de Acceso no Autorizado (401)
* Abrir el navegador en modo incógnito e intentar navegar directamente a `http://localhost:5173/ordenes`.
* **Resultado:** `ProtectedRoute` intercepta la navegación y redirige automáticamente a `/login`.

### Paso 2: Autenticación como Mecánico
* En `/login`, hacer clic en el botón de prueba rápida **"Rol Mecánico"** (credenciales: `mecanico` / `Password123!`).
* Presionar "Iniciar Sesión".
* **Resultado:** Redirige a `/ordenes`. El badge superior muestra el nombre `mecanico` y el rol `MECANICO` en color cian.
* Observar que el botón de **Eliminar** aparece deshabilitado con el tooltip de restricción de seguridad OWASP.

### Paso 3: Demostración de Bloqueo por Rol Insuficiente (403)
* Abrir la consola de desarrollador o ejecutar una llamada HTTP intentando un `DELETE /api/v1/ordenes-trabajo/1` con el token de mecánico.
* **Resultado:** El servidor responde con código HTTP **403 Forbidden** y el frontend muestra alerta de acción denegada.

### Paso 4: Cierre de Sesión y Autenticación como Admin
* Hacer clic en "Salir". El token en `sessionStorage` se destruye inmediatamente.
* Iniciar sesión como **"Rol Admin"** (credenciales: `admin` / `Password123!`).
* **Resultado:** Redirige a `/ordenes`. El badge superior muestra el rol `ADMIN` en color púrpura. El botón **Eliminar** ahora se encuentra activo y visible.

### Paso 5: Operaciones del CRUD Completo
1. **Creación:** Clic en "Nueva Orden". Seleccionar cliente, vehículo y mecánico desde los selectores dinámicos. Llenar observaciones y guardar. Aparece la notificación de éxito y la tabla se actualiza automáticamente gracias a TanStack Query.
2. **Detalle:** Clic en el botón "Ver" de la orden creada. Se abre el modal accesible con todos los datos relacionados.
3. **Edición:** Clic en "Editar". Modificar el estado a "En Proceso" o cambiar observaciones. Guardar.
4. **Eliminación:** Clic en el botón rojo de "Eliminar". Se despliega el diálogo accesible de confirmación `ConfirmDialog`. Al confirmar, la orden es eliminada de la base de datos.

### Paso 6: Demostración de Accesibilidad y Responsividad
* **Navegación exclusiva por teclado:** Presionar `Tab` repetidamente: evidenciar el enlace *Skip-to-content*, los anillos de foco visibles y la trampa de foco dentro del modal. Presionar `Escape` para cerrarlo.
* **Vista Móvil:** Abrir las herramientas de desarrollador (F12) y activar emulación móvil en 360 px (Pixel o iPhone SE). Evidenciar cómo la tabla se convierte en tarjetas limpias, sin scroll horizontal y con botones táctiles grandes (>= 44px).

---

## Diapositiva 8: Pruebas Automatizadas y Conclusión
* **Cobertura de Pruebas:**
  * **12 Pruebas Unitarias en Frontend (Vitest + Testing Library):** Login, validación Zod, guards de rutas, 403, listado CRUD y visibilidad por roles.
  * **Pruebas End-to-End (Playwright):** Flujo completo de login, creación, verificación en tabla, navegación y responsividad.
  * **3 Pruebas de Integración en Backend (.NET):** OpenAPI y rechazo de solicitudes anónimas.
* **Conclusión:**
  * Sistema integrado de extremo a extremo, resiliente ante entradas indebidas, estrictamente apegado a las normas de seguridad OWASP y accesible para todos los usuarios.

