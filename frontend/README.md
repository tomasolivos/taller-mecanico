# Frontend - Sistema de Gestión de Taller Mecánico

Aplicación frontend desarrollada en **React 19**, **TypeScript** y **Vite 8** para el consumo de la API RESTful del Taller Mecánico. Incorpora autenticación JWT, autorización por roles (Admin y Mecánico), accesibilidad **WCAG 2.2 Nivel AA**, diseño responsivo *mobile-first* y mitigación de vulnerabilidades **OWASP**.

---

## 🛠️ Tecnologías y Dependencias Principales

* **Framework:** React 19 con TypeScript
* **Bundler & Dev Server:** Vite 8
* **Enrutamiento:** React Router DOM v7
* **Cliente HTTP:** Axios con interceptores de solicitud (JWT Bearer) y respuesta (401, 403, 429)
* **Gestión de Estado Asíncrono:** @tanstack/react-query v5
* **Formularios y Validación:** React Hook Form + @hookform/resolvers + Zod
* **Iconografía:** Lucide React
* **Pruebas de Componentes:** Vitest + @testing-library/react + @testing-library/jest-dom + jsdom
* **Pruebas End-to-End (E2E):** @playwright/test

---

## 🚀 Comandos Disponibles

En el directorio `frontend/`:

* `npm install`: Instala todas las dependencias del proyecto.
* `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:5173`.
* `npm run build`: Compila TypeScript y genera el empaquetado optimizado para producción en `dist/`.
* `npm test`: Ejecuta la suite de pruebas unitarias y de componentes con Vitest.
* `npm run test:watch`: Ejecuta las pruebas en modo interactivo/watch.
* `npm run test:e2e`: Ejecuta las pruebas end-to-end con Playwright.
* `npm audit`: Ejecuta la auditoría de seguridad de dependencias (0 vulnerabilidades).

---

## ⚙️ Variables de Entorno

El archivo `.env` configura la URL base de la API:
```env
VITE_API_URL=http://localhost:5000/api/v1
```
> **Nota de Seguridad (OWASP):** No se incluyen llaves secretas ni credenciales privadas en variables `VITE_*` ya que se exponen públicamente en el bundle del navegador.
