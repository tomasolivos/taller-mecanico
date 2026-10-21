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
Solicitud `GET` a recurso protegido `/api/v1/ordenes-trabajo` sin encabezado `Authorization`:

```bash
$ curl -i -s http://localhost:5000/api/v1/ordenes-trabajo
```

**Registro de Respuesta del Servidor:**
```http
HTTP/1.1 401 Unauthorized
Content-Length: 0
Date: Wed, 21 Oct 2026 01:51:41 GMT
Server: Kestrel
WWW-Authenticate: Bearer
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
* **Análisis:** La API rechaza inmediatamente la petición por falta de credenciales JWT válidas y expone el esquema exigido `WWW-Authenticate: Bearer` junto a las cabeceras de endurecimiento HTTP.

---

### 4.2 Autorización por Rol y Bloqueo 403 Forbidden (OWASP API5:2023)
Intento de eliminación de orden de trabajo `DELETE /api/v1/ordenes-trabajo/1` utilizando el token JWT del rol **Mecanico**:

```powershell
# 1. Obtención de token con rol Mecanico
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/usuarios/login" -Method Post -ContentType "application/json" -Body '{"nombreUsuario":"mecanico","password":"Password123!"}'
$tokenMecanico = $login.token

# 2. Intento de ejecutar DELETE con privilegios insuficientes
curl -i -s -X DELETE "http://localhost:5000/api/v1/ordenes-trabajo/1" -H "Authorization: Bearer $tokenMecanico"
```

**Registro de Respuesta del Servidor:**
```http
HTTP/1.1 403 Forbidden
Content-Length: 0
Date: Wed, 21 Oct 2026 01:51:54 GMT
Server: Kestrel
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
* **Análisis:** Aunque el usuario está debidamente autenticado con JWT válido, el atributo `.RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })` valida que su rol no posee privilegios administrativos y bloquea la operación con **403 Forbidden**. En contraparte, una solicitud con el token de `admin` es procesada exitosamente con `204 No Content`.

---

### 4.3 Bloqueo y Restricción por Política de Orígenes Cruzados (CORS)

#### Caso A: Solicitud Preflight desde Origen Autorizado (`http://localhost:5173`)
```bash
$ curl -i -s -X OPTIONS http://localhost:5000/api/v1/ordenes-trabajo \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
```

**Registro de Respuesta:**
```http
HTTP/1.1 204 No Content
Date: Wed, 21 Oct 2026 01:52:10 GMT
Server: Kestrel
Access-Control-Allow-Methods: GET
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
* **Resultado:** La API autoriza la comunicación retornando explícitamente `Access-Control-Allow-Origin: http://localhost:5173`.

#### Caso B: Solicitud Preflight desde Origen No Autorizado (`https://sitio-malicioso.com`)
```bash
$ curl -i -s -X OPTIONS http://localhost:5000/api/v1/ordenes-trabajo \
  -H "Origin: https://sitio-malicioso.com" \
  -H "Access-Control-Request-Method: GET"
```

**Registro de Respuesta:**
```http
HTTP/1.1 204 No Content
Date: Wed, 21 Oct 2026 01:52:15 GMT
Server: Kestrel
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
* **Resultado y Bloqueo:** La API **omite completamente la cabecera `Access-Control-Allow-Origin`**. Ante esto, el motor de seguridad del navegador web bloquea de inmediato la petición con el siguiente error:
  `Access to fetch at 'http://localhost:5000/api/v1/ordenes-trabajo' from origin 'https://sitio-malicioso.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

---

### 4.4 Neutralización de Entradas Maliciosas (SQLi, XSS y Validación Estricta)

#### A. Neutralización de Intento de Inyección SQL (SQLi)
Envío de payload clásico de derivación de autenticación (`admin' OR '1'='1 --`):

```powershell
$body = @{ nombreUsuario = "admin' OR '1'='1 --"; password = "Password123!" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/usuarios/login" -Method Post -ContentType "application/json" -Body $body
```

**Registro:**
```
Status: 401
StatusDescription: Unauthorized
```
* **Análisis:** Entity Framework Core parametrizó automáticamente la consulta LINQ/SQL (`GetUsuarioConRolByNombreAsync`), tratando el valor malicioso estrictamente como un literal de texto y neutralizando cualquier intento de inyección o bypass.

#### B. Neutralización de Scripting entre Sitios (XSS)
Envío de payload malicioso `<script>alert('XSS-Attack')</script><img src=x onerror=alert('PWNED')>` en el campo de observaciones:

```powershell
$loginAdmin = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/usuarios/login" -Method Post -ContentType "application/json" -Body '{"nombreUsuario":"admin","password":"Password123!"}'
$xssBody = @{
    clienteId = 1
    vehiculoId = 1
    mecanicoId = 1
    fechaIngreso = "2026-10-21T00:00:00Z"
    estado = "Pendiente"
    observaciones = "<script>alert('XSS-Attack')</script><img src=x onerror=alert('PWNED')>"
} | ConvertTo-Json
$headers = @{ "Authorization" = "Bearer $($loginAdmin.token)" }
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/ordenes-trabajo" -Method Post -Headers $headers -ContentType "application/json" -Body $xssBody
```

**Mecanismo de Neutralización:**
1. **Frontend React:** La aplicación no utiliza `dangerouslySetInnerHTML` (`git grep "dangerouslySetInnerHTML"` devuelve 0 resultados). El renderizado mediante expresiones JSX `{orden.observaciones}` fuerza la creación de nodos de texto DOM planos (`TextNode`), escapando automáticamente los caracteres `<`, `>`, `"` y `&`.
2. **Cabeceras HTTP:** El servidor emite `X-Content-Type-Options: nosniff` y `X-XSS-Protection: 1; mode=block`.

#### C. Validación de Contrato DTO con RFC 9110 (400 Bad Request)
Envío de datos malformados o vacíos a `/api/v1/ordenes-trabajo`:

```powershell
$invalidBody = @{
    clienteId = 0
    vehiculoId = 0
    mecanicoId = 0
    fechaIngreso = "2026-10-21T00:00:00Z"
    estado = ""
} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/ordenes-trabajo" -Method Post -Headers $headers -ContentType "application/json" -Body $invalidBody
```

**Registro de Respuesta:**
```json
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Estado": ["El estado de la orden es obligatorio."],
    "ClienteId": ["Debe seleccionar un cliente válido."],
    "VehiculoId": ["Debe seleccionar un vehículo válido."],
    "MecanicoId": ["Debe seleccionar un mecánico válido."]
  }
}
```

---

### 4.5 Límite de Tasa (Rate Limiting - 429 Too Many Requests - OWASP API4:2023)
Envío de ráfaga automatizada de solicitudes consecutivas al endpoint sensible `/api/v1/usuarios/login` para superar la cuota de 10 peticiones por minuto por IP:

```powershell
1..12 | ForEach-Object {
    $res = curl.exe -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/api/v1/usuarios/login -H "Content-Type: application/json" -d '{"nombreUsuario":"admin","password":"Password123!"}'
    Write-Output "Intento $_ -> HTTP: $res"
}
```

**Registro de Ejecución:**
```
Intento 1  -> HTTP: 200
Intento 2  -> HTTP: 200
...
Intento 9  -> HTTP: 200
Intento 10 -> HTTP: 200
Intento 11 -> HTTP: 429
Intento 12 -> HTTP: 429
```

**Encabezados HTTP devueltos en el Intento #11:**
```http
HTTP/1.1 429 Too Many Requests
Content-Length: 0
Date: Wed, 21 Oct 2026 01:53:12 GMT
Server: Kestrel
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
* **Comportamiento en Frontend:** El interceptor de Axios en `src/services/apiClient.ts` captura el status `429` y despliega la alerta accesible:  
  *"Límite de solicitudes alcanzado (Rate Limit). Espere un minuto antes de intentar nuevamente."* Evitando fallos no controlados.

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

