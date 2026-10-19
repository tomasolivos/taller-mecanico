# Bitácora de Uso de Inteligencia Artificial Generativa (AI Log)

**Asignatura:** Lenguaje Programación Web II  
**Evaluación:** Trabajo 2: Frontend, consumo de API y seguridad  
**Estudiante:** Tomás  
**Docente:** Enso Guidotti  
**Fecha:** Octubre 2026  
**Repositorio GitHub:** [https://github.com/tomasolivos/taller-mecanico](https://github.com/tomasolivos/taller-mecanico)

---

## 1. Declaración de Herramientas y Modelos Utilizados

De acuerdo con lo establecido en las condiciones del trabajo, se declara el uso asistido de herramientas de inteligencia artificial generativa durante el desarrollo del proyecto:

* **Herramienta principal:** Google Antigravity IDE (Pair Programming Assistant).
* **Modelo utilizado:** Gemini 3.8 Flash (High) - Configuración de razonamiento y generación de código de alta precisión.
* **Tipo de cuenta / Plan:** Cuenta institucional / Antigravity Developer Suite.
* **Declaración de autoría:** La herramienta se utilizó como asistente técnico para la arquitectura de componentes, redacción de esquemas de validación Zod, diseño accesible y scaffolding de pruebas automatizadas. Todo el código generado fue inspeccionado, ajustado, probado y ejecutado localmente, demostrando su correcto funcionamiento y dominio técnico.

---

## 2. Registro de Prompts y Decisiones por Área Temática

### 2.1 Arquitectura del Frontend y Configuración
* **Prompt relevante:**
  > *"Diseña la arquitectura de un proyecto React con Vite y TypeScript para consumir una API RESTful de Taller Mecánico (.NET 10). Se requiere separación por capas (features, common components, services, context, types) y manejo de estado asíncrono con TanStack Query."*
* **Respuesta de la IA:**
  Propuso estructura modular con `@tanstack/react-query`, `react-router-dom` y `axios`.
* **Lo que se aceptó:**
  La estructura de carpetas modular por características (`features/ordenes`, `features/auth`, `features/clientes`, `features/catalog`), la configuración de alias y la centralización de tipos en `src/types/`.
* **Lo que se corrigió / descartó:**
  * Se corrigió la configuración de TypeScript (`tsconfig.app.json`): la plantilla de Vite 8 incluía `verbatimModuleSyntax: true` y opciones muy estrictas que generaban errores de importación de tipos en bundler. Se ajustó `verbatimModuleSyntax: false` y se configuró `vitest/config` en `vite.config.ts`.
  * Se añadió un puerto fijo (`5173`) coincidente con la política CORS del backend de .NET.

---

### 2.2 Capa de Consumo HTTP y Seguridad JWT
* **Prompt relevante:**
  > *"Crea un cliente centralizado de Axios con interceptores para adjuntar el token JWT Bearer guardado en sessionStorage, gestionar errores 401 (expiración o token inválido), 403 (permiso denegado por rol) y 429 (límite de peticiones de OWASP), además de un servicio de autenticación con verificación de expiración."*
* **Respuesta de la IA:**
  Generó `apiClient.ts` con interceptores de solicitud y respuesta, y `authService.ts` con decodificación en base64 del token JWT para verificar `exp`.
* **Lo que se aceptó:**
  * El despacho del evento personalizado `window.dispatchEvent(new CustomEvent('auth:expired'))` para que el contexto de React reaccione inmediatamente y limpie la sesión.
  * La normalización del objeto de error en `ApiErrorDetail` para estandarizar respuestas de MiniValidation y excepciones de la API.
* **Lo que se corrigió / descartó:**
  * Se descartó el uso de `localStorage` para el almacenamiento del JWT por su persistencia indefinida frente a ataques XSS. Se implementó `sessionStorage` que se aísla por pestaña y se elimina al cerrarse el navegador.
  * Se añadió una comprobación de padding en la función de decodificación base64 (`atob`) para evitar excepciones si el string JWT no tenía múltiplos de 4 caracteres.

---

### 2.3 Accesibilidad (WCAG 2.2 Nivel AA) y Diseño Responsivo
* **Prompt relevante:**
  > *"Implementa vistas y componentes que cumplan estrictamente WCAG 2.2 nivel AA: HTML semántico, etiquetas y mensajes de error asociados mediante aria-describedby y aria-live, navegación por teclado con foco visible y trampa de foco en modales, botones táctiles de al menos 44x44 px, y diseño mobile-first que transforme la tabla de órdenes en tarjetas en pantallas menores a 768px."*
* **Respuesta de la IA:**
  Generó `Modal.tsx` con trampa de foco mediante listeners de `Tab` y `Escape`, `Alert.tsx` con `role="alert"` y atributos ARIA, y estilos CSS para el switch tabla/tarjetas.
* **Lo que se aceptó:**
  * Enlace oculto *Skip to Content* (`.skip-link`) en la cabecera.
  * Regla global `:focus-visible` con contraste de 3px.
  * Tamaño mínimo `minWidth: 44px, minHeight: 44px` en todos los controles interactivos.
  * Estados de orden representados por color, icono y texto explícito simultáneamente (para usuarios con daltonismo).
* **Lo que se corrigió / descartó:**
  * La IA originalmente omitió restaurar el foco al elemento disparador tras cerrar el modal. Se agregó un `useRef` para guardar `document.activeElement` y devolver el foco cuando el modal se desmonta.
  * Se modificó `index.html` para asegurar `lang="es"` y meta viewport estricto.

---

### 2.4 Mitigación de Vulnerabilidades OWASP y Seguridad Backend
* **Prompt relevante:**
  > *"Revisa el backend de ASP.NET Core y el cliente frontend para aplicar mitigaciones de al menos 5 riesgos de OWASP Top 10 API y Web, incluyendo Rate Limiting estricto en login, cabeceras HTTP de seguridad (X-Frame-Options, X-Content-Type-Options, etc.), CORS restringido, sanitización contra XSS y validación de roles en endpoint DELETE."*
* **Respuesta de la IA:**
  Sugirió middleware de cabeceras de seguridad en `Program.cs`, política `LoginRateLimit` en el rate limiter de .NET y validación de rol `Admin` en el endpoint de eliminación.
* **Lo que se aceptó:**
  * Incorporación en `Program.cs` del middleware de cabeceras de seguridad HTTP (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`).
  * Inclusión de `.RequireRateLimiting("LoginRateLimit")` en el endpoint `/usuarios/login`.
  * Verificación de que el backend valide el rol `Admin` en `ordenesTrabajo.MapDelete("/{id}", ...).RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })`.
* **Lo que se corrigió / descartó:**
  * Se sincronizó la respuesta del endpoint `/login` para que devuelva tanto el token JWT como el objeto descriptivo del usuario (`usuarioId`, `nombre`, `correo`, `rol`), manteniendo compatibilidad retroactiva.

---

### 2.5 Pruebas Automatizadas (Vitest y Playwright)
* **Prompt relevante:**
  > *"Genera pruebas automatizadas con Vitest y Testing Library que cubran: 1) Formulario de login y validación Zod, 2) Guard de ruta protegida y 403, 3) Operaciones del CRUD con roles (Admin habilitado para borrar, Mecánico deshabilitado). Además genera la configuración y suite E2E con Playwright."*
* **Respuesta de la IA:**
  Generó suites de pruebas en `src/test/` y `e2e/taller-flow.spec.ts`.
* **Lo que se aceptó:**
  Mocks de servicios y context mediante `vi.spyOn` y `vi.mock`, pruebas de interacción con `fireEvent` y aserciones de accesibilidad con `@testing-library/jest-dom`.
* **Lo que se corrigió / descartó:**
  * En las pruebas de listado (`OrdenesCrud.test.tsx`), el selector `getByText` fallaba debido a que la patente y los IDs se renderizan tanto en la tabla de escritorio como en las tarjetas móviles. Se ajustó a `getAllByText` para contemplar ambos entornos responsivos.
  * Se configuró el ciclo de vida de `QueryClient` con `gcTime: 0` para evitar interferencias de cache entre tests unitarios.

---

## 3. Resumen de Aportes y Reflexión del Estudiante

El uso de la herramienta de IA permitió acelerar significativamente la generación de código repetitivo (*boilerplate*), el diseño de interfaces accesibles conforme a WCAG 2.2 AA y la redacción de pruebas unitarias exhaustivas. Sin embargo, la intervención humana fue crítica para:
1. Depurar conflictos de compilación en TypeScript y compatibilidad de herramientas de empaquetado.
2. Garantizar la coherencia del modelo de negocio del Taller Mecánico entre la base de datos SQL Server, la API en .NET y la interfaz de usuario en React.
3. Asegurar que las validaciones de seguridad se apliquen tanto en la capa de presentación (experiencia de usuario) como obligatoriamente en la capa del backend (regla de oro de OWASP).

