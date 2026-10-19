# Evidencias de Ejecución de Pruebas y Controles de Seguridad

**Asignatura:** Lenguaje Programación Web II  
**Evaluación 2:** Frontend, Consumo de API y Seguridad (UT2)  
**Proyecto:** Taller Mecánico  
**Estudiante:** Tomás  
**Fecha:** Octubre 2026  
**Repositorio GitHub:** [https://github.com/tomasolivos/taller-mecanico](https://github.com/tomasolivos/taller-mecanico)  

---

## 1. Evidencia de Pruebas Automatizadas de Frontend (Vitest)

Ejecución de la suite de 12 pruebas de componentes en el frontend (`npm test`):

```
> frontend@0.0.0 test
> vitest run

 RUN  v5.0.5 C:/Users/tomas/Downloads/TallerMecanico/TallerMecanico/frontend

 ✓ src/test/ProtectedRoute.test.tsx (3 tests) 62ms
   ✓ debe redirigir al login si el usuario no está autenticado
   ✓ debe redirigir a acceso denegado (403) si el usuario no tiene el rol permitido
   ✓ debe renderizar el contenido protegido cuando el usuario cumple con la autenticación y el rol

 ✓ src/test/LoginPage.test.tsx (4 tests) 349ms
   ✓ debe renderizar el título, los campos de formulario y botones accesibles
   ✓ debe mostrar errores de validación en cliente (Zod) si los campos están vacíos
   ✓ debe llamar a login con los valores ingresados al enviar el formulario válido
   ✓ debe permitir autocompletar credenciales de demostración para pruebas rápidas

 ✓ src/test/OrdenesCrud.test.tsx (5 tests) 497ms
   ✓ debe listar las órdenes de trabajo recibidas desde la API con su estado y datos asociados
   ✓ el rol Administrador debe tener visible y habilitado el botón de eliminar
   ✓ el rol Mecánico debe tener el botón de eliminar deshabilitado o bloqueado por seguridad OWASP
   ✓ debe filtrar reactivamente el listado al escribir en la barra de búsqueda
   ✓ debe abrir el modal de creación de orden al presionar "Nueva Orden"

 Test Files  3 passed (3)
      Tests  12 passed (12)
   Duration  2.44s
```

---

## 2. Evidencia de Pruebas de Integración del Backend (.NET 10)

Ejecución de la suite de pruebas del Trabajo 1 en el backend (`dotnet test`):

```
C:\Users\tomas\Downloads\TallerMecanico\TallerMecanico\TallerMecanico> dotnet test
  Determinando los proyectos que se van a restaurar...
  Todos los proyectos están actualizados para la restauración.
  TallerMecanico -> C:\Users\tomas\Downloads\TallerMecanico\TallerMecanico\TallerMecanico\bin\Debug\net10.0\TallerMecanico.dll
Serie de pruebas para C:\Users\tomas\Downloads\TallerMecanico\TallerMecanico\TallerMecanico\bin\Debug\net10.0\TallerMecanico.dll (.NETCoreApp,Version=v10.0)

  Correctas TallerMecanico.IntegrationTests.EspecialidadesIntegrationTests.CRUD_administrativo_rechaza_solicitudes_anonimas [824 ms]
  Correctas TallerMecanico.IntegrationTests.EspecialidadesIntegrationTests.OpenApi_expone_el_contrato_de_especialidades [757 ms]
  Correctas TallerMecanico.IntegrationTests.EspecialidadesIntegrationTests.OpenApi_expone_el_CRUD_de_ordenes_de_trabajo [1 s]

Correctas! - Con error: 0, Superado: 3, Omitido: 0, Total: 3, Duración: 2 s
```

---

## 3. Evidencia de Auditoría de Seguridad de Dependencias (`npm audit`)

Ejecución de auditoría de paquetes en `frontend/`:

```
C:\Users\tomas\Downloads\TallerMecanico\TallerMecanico\frontend> npm audit
found 0 vulnerabilities
```
* **Conclusión:** Ninguna vulnerabilidad crítica, alta, moderada o baja detectada en el árbol de dependencias de la aplicación cliente.

---

## 4. Evidencia de Controles de Seguridad en Tiempo de Ejecución

### 4.1 Bloqueo de Acceso Anónimo (401 Unauthorized)
Solicitud `GET` a `/api/v1/ordenes-trabajo` sin token en el encabezado `Authorization`:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/ordenes-trabajo" -Method Get
# Resultado: Error en el servidor remoto: (401) No autorizado.
```

### 4.2 Autorización por Rol y Bloqueo 403 Forbidden (OWASP API5:2023)
Solicitud `DELETE` a `/api/v1/ordenes-trabajo/{id}` autenticada con token del usuario `mecanico`:
```powershell
$headers = @{ "Authorization" = "Bearer $tokenMecanico" }
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/ordenes-trabajo/3" -Method Delete -Headers $headers
# Resultado: StatusCode: 403 (Forbidden)
# Mensaje: "Acceso denegado: El rol 'Mecanico' no tiene autorización para eliminar registros."
```
En contraparte, el token del usuario `admin` realiza la operación con éxito (**204 No Content**).

### 4.3 Verificación de Cabeceras HTTP de Seguridad (OWASP API8:2023)
Inspección de encabezados devueltos por el servidor Kestrel en cada respuesta:
```
Key                    Value
---                    -----
X-Content-Type-Options nosniff
X-Frame-Options        DENY
X-XSS-Protection       1; mode=block
Referrer-Policy        strict-origin-when-cross-origin
Permissions-Policy     camera=(), microphone=(), geolocation=()
```

### 4.4 Política de Orígenes Cruzados (CORS Restrictivo)
Configuración en `Program.cs` restringe el acceso exclusivamente a los orígenes autorizados del frontend:
* `http://localhost:5173` (Vite dev server)
* `http://localhost:3000` (React alternativo)
* `http://127.0.0.1:5173`
Cualquier solicitud originada desde un dominio o puerto no declarado es rechazada por la política del navegador antes de procesarse.

### 4.5 Límite de Tasa (Rate Limiting - OWASP API4:2023)
* Política `LoginRateLimit`: 10 solicitudes permitidas por minuto por dirección IP.
* En el intento #11 en una ventana de 60 segundos, la API devuelve:
```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
```
* El frontend captura el código 429 en el interceptor de Axios y muestra la notificación clara al usuario sin caerse ni bloquear la aplicación.

---

## 5. Evidencia de Accesibilidad y Responsividad

1. **Revisión WCAG 2.2 Nivel AA:**
   * Atributo `lang="es"` presente en `index.html`.
   * Enlace visible de salto al contenido principal (*Skip-to-content*) accesible en la primera pulsación de `Tab`.
   * Trampa de foco (*focus trap*) activa en diálogos modales (`role="dialog"`, `aria-modal="true"`): la tecla `Tab` cicla exclusivamente dentro del modal y la tecla `Escape` lo cierra, devolviendo el foco al botón disparador.
   * Contraste superior a **4.5:1** comprobado en todos los textos y fondos.
   * La información de estado de órdenes no depende sólo del color (combina colores contrastantes, iconos temáticos y etiquetas de texto explícitas).
2. **Diseño Responsivo Mobile-First:**
   * En anchos de pantalla `< 768px` (verificado en viewports de **320px**, **360px**, **390px** y **412px**), la tabla se oculta y se presenta una vista en tarjetas individuales (*cards*), eliminando el desplazamiento horizontal.
   * Todos los controles táctiles (botones de acción, selectores, campos de entrada) cumplen con el tamaño táctil mínimo de **44 × 44 px**.

