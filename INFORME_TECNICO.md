# Informe Técnico: Arquitectura Frontend, Consumo de API RESTful y Seguridad de Extremo a Extremo

**Asignatura:** Lenguaje Programación Web II  
**Unidad Temática:** UT2: Consumo de APIs RESTful desde aplicaciones frontend y seguridad  
**Caso de Negocio:** Sistema de Gestión para Taller Mecánico  
**Estudiante:** Tomás  
**Docente:** Enso Guidotti  
**Fecha:** Octubre 2026  

---

## 1. Resumen Ejecutivo y Alcance

El presente informe detalla las decisiones arquitectónicas, de seguridad, accesibilidad y diseño responsivo implementadas en el desarrollo de la aplicación frontend para el sistema de **Taller Mecánico**. La solución consume la API RESTful desarrollada en el Trabajo 1 (ASP.NET Core Web API), permitiendo la gestión integral del ciclo de vida del recurso principal (**Órdenes de Trabajo**) y sus recursos relacionados (**Clientes**, **Vehículos**, **Mecánicos**, **Servicios** y **Repuestos**), garantizando una experiencia de usuario accesible según pautas **WCAG 2.2 Nivel AA** y blindando el sistema bajo las recomendaciones de **OWASP API Security Top 10 (2023)** y **OWASP Top 10 Web**.

---

## 2. Decisiones de Diseño Arquitectónico

### 2.1 Framework y Bundler
* **Tecnología seleccionada:** **React 19** con **TypeScript** y **Vite 8**.
* **Justificación:**
  * **Vite** ofrece tiempos de compilación instantáneos mediante Hot Module Replacement (HMR) y empaquetado optimizado mediante Rollup en producción.
  * **TypeScript** garantiza seguridad de tipos estricta (*type-safety*) que refleja fielmente los contratos y DTOs de la API, eliminando errores en tiempo de ejecución al acceder a propiedades del modelo.
  * La estructura sigue el patrón modular por capas y características (*feature-based*):
    * `src/features/`: Módulos de negocio aislados (`auth`, `ordenes`, `clientes`, `catalog`).
    * `src/components/common/`: Componentes reutilizables y accesibles (`Navbar`, `Modal`, `ConfirmDialog`, `Alert`, `LoadingSpinner`, `Pagination`, `ProtectedRoute`).
    * `src/services/`: Capa de consumo HTTP desacoplada de la interfaz.
    * `src/context/`: Gestión de estado de autenticación y autorización global.
    * `src/types/`: Interfaces y contratos de dominio y DTOs.

### 2.2 Enrutamiento y Protección de Rutas
* **Tecnología:** **React Router v7**.
* **Estrategia:** Se implementó el componente de guardia `ProtectedRoute.tsx`. Las rutas privadas (`/ordenes`, `/clientes`, `/servicios`) requieren que el usuario posea un token JWT vigente no expirado. Si el usuario intenta acceder a una ruta sin autenticarse, es redirigido a `/login` guardando la ubicación original para redirigir tras un login exitoso.
* **Control de roles:** La ruta `/acceso-denegado` captura intentos de acceso o acciones de usuarios con privilegios insuficientes (ej. rol `Mecanico` intentando acciones exclusivas de `Admin`).

### 2.3 Manejo de Estado Asíncrono
* **Tecnología:** **TanStack React Query v5**.
* **Justificación:** Separa el estado de la interfaz (*UI state*) del estado del servidor (*server cache*). Proporciona de forma declarativa:
  * Cache inteligente de solicitudes HTTP.
  * Estados integrados de carga (`isLoading`), error (`isError`) y éxito.
  * Revalidación automática e invalidación de queries tras mutaciones (`invalidateQueries`), manteniendo sincronizado el listado tras crear, editar o eliminar órdenes sin recargar la página.

---

## 3. Estrategia de Autenticación JWT y Almacenamiento

### 3.1 Justificación del Almacenamiento
Para el almacenamiento del token JWT se evaluaron tres alternativas en el navegador:

| Mecanismo | Ventajas | Riesgos / Desventajas | Decisión |
| :--- | :--- | :--- | :--- |
| **Memoria (Variables de estado)** | Inmune a XSS persistente. | Se pierde al recargar la página o cambiar de pestaña, deteriorando la experiencia de usuario. | Descartado para sesión principal. |
| **Cookie HttpOnly + SameSite** | Inmune a lectura mediante scripts XSS. | Requiere configuración de dominio compartido entre frontend y backend y mitigación anti-CSRF adicional. | Considerado para arquitecturas BFF. |
| **`sessionStorage` + Bearer Header** | El token se destruye automáticamente al cerrar la pestaña/navegador; aislado por origen y pestaña; no vulnerable a ataques CSRF al enviarse explícitamente en el encabezado `Authorization: Bearer`. | Vulnerable si existiera una inyección de script XSS no neutralizada. | **Estrategia Seleccionada y Mitigada.** |

* **Mitigación complementaria aplicada:**
  1. No se utiliza `dangerouslySetInnerHTML` en ningún componente del proyecto (React escapa texto por defecto).
  2. El interceptor centralizado valida la expiración (`exp` del payload JWT) cada 15 segundos y de forma reactiva.
  3. No se expone el token en consolas de desarrollo (`console.log`) ni en parámetros de URL.
  4. Cierre de sesión explícito (`logout`) limpia exhaustivamente `sessionStorage` y reinicia el estado global.

---

## 4. Matriz de Mitigación de Riesgos de Seguridad (OWASP)

Se implementaron controles en cliente y servidor para mitigar los riesgos de OWASP:

| # | Riesgo | Referencia OWASP | Lado | Mitigación Implementada en el Código | Evidencia Verificable |
| :-: | :--- | :--- | :-: | :--- | :--- |
| **1** | **Robo o filtración del token** | API2:2023 Broken Authentication | **Cliente** | Almacenamiento en `sessionStorage`, expiración controlada de 5 minutos, auto-logout al expirar o recibir 401, envío exclusivo como Bearer en encabezados HTTP. | Al vencer el token o recibir 401, el cliente borra el token y redirige a `/login`. |
| **2** | **Control de acceso roto a nivel de función** | API5:2023 Broken Function Level Authorization | **Ambos** | El frontend oculta/deshabilita el botón de eliminar para el rol `Mecanico`. En el backend, el endpoint `DELETE /api/v1/ordenes-trabajo/{id}` tiene `[Authorize(Roles = "Admin")]`. | Un usuario con rol `Mecanico` que fuerce un DELETE por HTTP recibe código **403 Forbidden**. |
| **3** | **Cross-Site Scripting (XSS)** | OWASP Top 10: Injection | **Cliente** | Renderizado defensivo como texto plano de todas las propiedades devueltas por la API, ausencia total de `dangerouslySetInnerHTML`, cabecera `X-XSS-Protection: 1; mode=block`. | Intentos de ingresar `<script>alert('xss')</script>` en observaciones son sanitizados y mostrados como texto literal inofensivo. |
| **4** | **Consumo de API y validación de esquemas** | API10:2023 Unsafe Consumption / Injection | **Ambos** | Validación en cliente con **Zod** y **React Hook Form** antes del envío; validación en backend con **MiniValidation** y **Data Annotations** en DTOs. | Respuestas 400 con errores de validación de campos son capturadas y presentadas campo por campo (`aria-describedby`). |
| **5** | **Fuerza bruta y consumo sin límites** | API4:2023 Unrestricted Resource Consumption | **Ambos** | Rate Limiting en backend con política estricta `LoginRateLimit` (10 peticiones/minuto) y limiter global (100 peticiones/minuto). En cliente, manejo explícito del error **429 Too Many Requests**. | Al superar 10 intentos de login en un minuto, el servidor rechaza con 429 y el frontend muestra mensaje claro de seguridad. |
| **6** | **Configuración de seguridad y cabeceras** | API8:2023 Security Misconfiguration | **API** | Política CORS restringida a orígenes explícitos (`http://localhost:5173`, `http://localhost:3000`), cabeceras HTTP de seguridad (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`). | Inspección de cabeceras HTTP en respuestas de la API evidencia las directivas de seguridad. |
| **7** | **Dependencias vulnerables** | OWASP Top 10: Vulnerable Components | **Cliente** | Auditoría periódica de paquetes mediante `npm audit`. | Ejecución de `npm audit` arroja **0 vulnerabilidades** en el árbol de dependencias del frontend. |
| **8** | **Secretos expuestos en el bundle** | OWASP Top 10: Security Misconfiguration | **Cliente** | Las variables `VITE_*` no contienen credenciales ni llaves privadas. Archivo `.env.example` versionado sin secretos reales y `.env` excluido en `.gitignore`. | Revisión del repositorio confirma ausencia de credenciales de base de datos o llaves JWT. |

---

## 5. Accesibilidad (WCAG 2.2 Nivel AA)

Para asegurar la inclusión y cumplimiento de estándares internacionales de accesibilidad, se implementaron las siguientes medidas:
1. **HTML Semántico y Landmarks:**
   * Uso de elementos estructurales `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` y `<table>`.
   * Encabezados jerárquicos ordenados (`<h1>` a `<h3>`).
2. **Formularios Accesibles:**
   * Cada control de entrada posee su `<label>` asociado mediante `htmlFor` e `id`.
   * Errores de validación vinculados con `aria-describedby="[campo]-error"` y anunciados mediante `role="alert"` y `aria-live="polite"`.
   * Indicación visual y textual de campos obligatorios (`aria-required="true"` y asterisco).
3. **Navegación por Teclado y Gestión del Foco:**
   * Enlace de salto al contenido principal (*Skip-to-content*) al presionar `Tab` en la carga.
   * Anillos de foco visibles (`:focus-visible` con `outline: 3px solid #2563eb; outline-offset: 2px`).
   * Trampa de foco (*focus trapping*) en modales: el tabulador cicla exclusivamente dentro del diálogo abierto y la tecla `Escape` cierra el modal, devolviendo el foco al elemento disparador.
4. **Contraste y Percepción:**
   * Relación de contraste superior a **4.5:1** en todo el texto principal respecto al fondo.
   * La información no depende exclusivamente del color: los estados de las órdenes (`Pendiente`, `En Proceso`, `Completada`, `Cancelada`) combinan colores distintivos con iconos temáticos y texto explicativo explícito.
5. **Idioma y Metadatos:**
   * Atributo `lang="es"` definido en la etiqueta raíz `<html>` de `index.html`.

---

## 6. Diseño Responsivo Mobile-First

1. **Meta Viewport:** Configurado con `width=device-width, initial-scale=1.0`.
2. **Maquetación Fluida:** Flexbox y CSS Grid con unidades relativas (`rem`, `%`, `vh/vw`).
3. **Adaptabilidad del CRUD:**
   * **Escritorio / Tablet (>= 768px):** Visualización en tabla tabular completa con columnas ordenadas.
   * **Móvil (< 768px, desde 320px):** La tabla se reemplaza fluidamente por tarjetas independientes (*mobile cards*), evitando el desplazamiento horizontal (*no horizontal scroll*).
4. **Objetivos Táctiles:** Todos los botones, enlaces y selectores poseen un área táctil mínima de **44 × 44 px**, facilitando la interacción en pantallas táctiles y dispositivos móviles.
5. **Zoom de Texto:** La interfaz mantiene su legibilidad y funcionalidad sin desbordamientos al aplicar zoom del navegador hasta el **200%**.

---

## 7. Estrategia de Pruebas Automatizadas

1. **Pruebas de Componentes (Vitest + Testing Library):**
   * `LoginPage.test.tsx`: Verifica renderizado accesible, validación de esquemas Zod en cliente y envío de credenciales.
   * `ProtectedRoute.test.tsx`: Verifica bloqueo y redirección de usuarios anónimos al login y de usuarios no autorizados a acceso denegado (403).
   * `OrdenesCrud.test.tsx`: Verifica listado de datos, filtrado reactivo de búsqueda, modal de creación y visibilidad condicionada del botón eliminar según el rol del usuario.
   * **Resultado:** **12/12 pruebas unitarias exitosas**.
2. **Pruebas End-to-End (Playwright):**
   * `taller-flow.spec.ts`: Ejecuta el flujo integral desde el login como Administrador, navegación al listado, apertura del formulario, creación de una orden y verificación de su persistencia en el listado, además de validar responsividad en viewport móvil de 360 px.
3. **Pruebas de Integración Backend (.NET):**
   * `EspecialidadesIntegrationTests.cs`: Ejecutadas con `dotnet test` y `vstest.console.exe`, validando contratos OpenAPI y rechazo de accesos no autenticados en la API.
   * **Resultado:** **3/3 pruebas de backend exitosas**.

---

## 8. Conclusiones

La integración desarrollada cumple a cabalidad con los requerimientos técnicos y pedagógicos del Trabajo 2. Se construyó una aplicación React modular, segura y altamente accesible que consume la API RESTful existente, respeta el principio de menor privilegio con autorización por roles tanto en cliente como en servidor, y neutraliza los principales vectores de ataque señalados por OWASP, entregando un producto robusto y preparado para una demostración en vivo.
