# Sistema de Gestión de Taller Mecánico - Trabajo 2: Frontend, Consumo de API y Seguridad

**Asignatura:** Lenguaje Programación Web II  
**Unidad Temática:** UT2: Consumo de APIs RESTful desde aplicaciones frontend y seguridad  
**Estudiante:** Tomás  
**Docente:** Enso Guidotti  
**Evaluación:** 100% de Evaluación 2  

---

## 📌 Descripción General del Proyecto

Este repositorio contiene la solución completa e integrada para el **Sistema de Gestión de Taller Mecánico**:
1. **Backend:** API RESTful desarrollada con **ASP.NET Core Web API (.NET 10)**, Entity Framework Core y SQL Server, con autenticación JWT, rate limiting y cabeceras de seguridad.
2. **Frontend:** Aplicación web moderna construida con **React 19**, **TypeScript**, **Vite 8**, **TanStack React Query**, **React Hook Form** y **Zod**, diseñada bajo las pautas de accesibilidad **WCAG 2.2 Nivel AA** y principios de diseño responsivo *mobile-first*.

---

## 📁 Estructura del Repositorio

```
TallerMecanico/
├── frontend/                     # Aplicación Frontend React + Vite + TypeScript
│   ├── src/
│   │   ├── components/common/    # Componentes reutilizables y accesibles (Navbar, Modal, Alert, etc.)
│   │   ├── context/              # Contexto de autenticación y autorización (AuthContext)
│   │   ├── features/             # Módulos por caso de uso (ordenes, auth, clientes, catalog)
│   │   ├── services/             # Cliente HTTP centralizado (Axios) e interceptores
│   │   ├── types/                # Interfaces y DTOs de dominio
│   │   └── test/                 # Pruebas unitarias de componentes (Vitest + Testing Library)
│   ├── e2e/                      # Pruebas End-to-End con Playwright
│   ├── .env                      # Configuración de variables de entorno local
│   ├── .env.example              # Plantilla de variables de entorno (sin secretos)
│   └── package.json
│
├── TallerMecanico/               # Backend API RESTful (.NET 10)
│   ├── Endpoints/                # Endpoints agrupados y versionados (/api/v1/...)
│   ├── Middlewares/              # Manejo global de excepciones, logging y cabeceras de seguridad
│   ├── Models/                   # Entidades del DbContext y mapeo a base de datos
│   ├── Repositories/             # Patrón repositorio para acceso a datos
│   ├── Services/                 # Servicios de negocio y autenticación (hashing PBKDF2)
│   ├── ValidacionesDTO/          # DTOs y validaciones de contrato
│   ├── seed.sql                  # Script SQL con datos iniciales para demostración
│   └── appsettings.json          # Configuración del servidor (CORS, JWT, conexión SQL)
│
├── .env.example                  # Variables de entorno backend de ejemplo
├── INFORME_TECNICO.md            # Informe técnico de decisiones de diseño y matriz OWASP
├── AI_LOG.md                     # Bitácora detallada de uso de Inteligencia Artificial Generativa
├── PRESENTACION.md               # Diapositivas y guión de demostración en vivo
└── README.md                     # Este archivo con instrucciones de ejecución
```

---

## 🔑 Credenciales de Prueba Preconfiguradas

Para la evaluación y demostración del control de acceso por roles (OWASP API5:2023):

| Usuario | Contraseña | Rol | Permisos y Capacidades |
| :--- | :--- | :--- | :--- |
| **`admin`** | `Password123!` | **`Admin`** | **Acceso total:** Listar, ver detalle, crear, editar y **eliminar** órdenes de trabajo. |
| **`mecanico`** | `Password123!` | **`Mecanico`** | **Acceso operativo:** Listar, ver detalle, crear y editar. **Botón eliminar bloqueado en UI y rechazado con 403 Forbidden por la API**. |

> **Nota:** La pantalla de inicio de sesión (`/login`) cuenta con botones de acceso rápido (*"Rol Admin"* y *"Rol Mecánico"*) para agilizar la demostración en vivo.

---

## 🚀 Instrucciones de Instalación y Puesta en Marcha

### Prerrequisitos
* **Node.js** v18 o superior y **npm**.
* **.NET 10 SDK** (o runtime de .NET 10).
* **Microsoft SQL Server** (ej. `SQLEXPRESS` local con base de datos `TallerMecanicoDB`).

---

### Paso 1: Configurar la Base de Datos
1. Verificar que el servicio de **SQL Server** esté en ejecución.
2. Si es la primera vez que se ejecuta, el backend aplicará automáticamente las migraciones de Entity Framework al arrancar.
3. Para sembrar los datos iniciales de prueba (clientes, vehículos, mecánicos, servicios y órdenes):
   ```powershell
   sqlcmd -S ".\sqlexpress" -U sa -P ipvg2026 -d TallerMecanicoDB -i "TallerMecanico\seed.sql"
   ```

---

### Paso 2: Iniciar el Backend API (.NET 10)
En una terminal:
```powershell
cd TallerMecanico\TallerMecanico
dotnet run
```
* O alternativamente ejecutando el binario compilado:
  ```powershell
  .\TallerMecanico\bin\Debug\net10.0\TallerMecanico.exe
  ```
* La API estará escuchando en: **`http://localhost:5000`** (o `https://localhost:7027`).
* Documentación OpenAPI disponible en: **`http://localhost:5000/scalar/v1`** o **`http://localhost:5000/openapi/v1.json`**.

---

### Paso 3: Iniciar la Aplicación Frontend (React + Vite)
En una segunda terminal:
```powershell
cd frontend
npm install
npm run dev
```
* La aplicación frontend se iniciará en: 👉 **`http://localhost:5173`**.

---

## 🧪 Ejecución de Pruebas Automatizadas

### 1. Pruebas Unitarias y de Componentes (Frontend)
Ejecutadas con **Vitest** y **Testing Library** con mocks de la API (12 pruebas automáticas que cubren formulario de login, validación de Zod, guard de rutas protegidas y CRUD con validación de roles):
```powershell
cd frontend
npm test
```
*Resultado esperado:*
```
✓ src/test/ProtectedRoute.test.tsx (3 tests)
✓ src/test/LoginPage.test.tsx (4 tests)
✓ src/test/OrdenesCrud.test.tsx (5 tests)

Test Files  3 passed (3)
     Tests  12 passed (12)
```

### 2. Pruebas End-to-End (E2E con Playwright)
Ejecuta el flujo completo en navegador automatizado (login, creación de orden, listado, guard y responsividad):
```powershell
cd frontend
npx playwright test
```

### 3. Pruebas de Integración del Backend (.NET)
Ejecuta las pruebas de contrato OpenAPI y autorización de endpoints en el servidor:
```powershell
cd TallerMecanico\TallerMecanico
dotnet test
```
*Resultado esperado:*
```
Correctas! - Con error: 0, Superado: 3, Omitido: 0, Total: 3
```

### 4. Auditoría de Seguridad de Dependencias
```powershell
cd frontend
npm audit
```
*Resultado:* **0 vulnerabilidades encontradas**.

---

## 🛡️ Medidas de Seguridad Implementadas (OWASP)

1. **API2:2023 Autenticación Rota:** JWT con expiración de 5 minutos, firma HMAC-SHA256, auto-logout al expirar o recibir 401, almacenamiento justificado en `sessionStorage`.
2. **API5:2023 Autorización Rota a Nivel de Función:** El rol `Mecanico` tiene bloqueada la eliminación en frontend y recibe **403 Forbidden** si fuerza la solicitud DELETE en la API.
3. **OWASP Top 10 Web (XSS):** React escapa contenido por defecto, ausencia total de `dangerouslySetInnerHTML`, cabecera `X-XSS-Protection`.
4. **API4:2023 Consumo Ilimitado de Recursos:** Rate Limiting con política `LoginRateLimit` de 10 peticiones/minuto en login y 100 peticiones globales.
5. **API8:2023 Configuración Insegura:** CORS con lista blanca explícita (`http://localhost:5173`), cabeceras HTTP de seguridad (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
6. **Manejo de Errores Seguro:** Respuestas de error sin trazas de pila (*stack traces*) internas en producción.

---

## ♿ Accesibilidad (WCAG 2.2 AA) y Diseño Responsivo

* **Accesibilidad:** Marcado semántico HTML5, navegación 100% por teclado con foco visible (`:focus-visible`), enlace de salto (*Skip to content*), trampa de foco en modales, atributos `aria-describedby` y `aria-live` en formularios, y contraste superior a 4.5:1.
* **Diseño Responsivo:** Mobile-first desde 320 px de ancho. La tabla de órdenes de trabajo se convierte en tarjetas táctiles (*cards*) en pantallas menores a 768 px. Todos los elementos interactivos cuentan con un área mínima de **44 × 44 px**.

---

## 📄 Documentación Adicional

* [INFORME_TECNICO.md](INFORME_TECNICO.md): Informe técnico formal con la justificación de decisiones y matriz completa de riesgos mitigados.
* [AI_LOG.md](AI_LOG.md): Bitácora de uso de Inteligencia Artificial Generativa (herramientas, modelos, prompts y decisiones).
* [PRESENTACION.md](PRESENTACION.md): Diapositivas y guión de demostración en vivo para la exposición individual.

