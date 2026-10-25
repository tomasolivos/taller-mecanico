# IA LOG

**Asignatura:** Lenguaje Programación Web II  
**Estudiante:** Tomás  
**Docente:** Enso Guidotti  
**Repositorio GitHub:** [https://github.com/tomasolivos/taller-mecanico](https://github.com/tomasolivos/taller-mecanico)

---

## 1. Declaración de Herramientas y Modelos Utilizados

De acuerdo con lo establecido en las condiciones del trabajo, se declara el uso asistido de herramientas de inteligencia artificial generativa durante el desarrollo del proyecto:

* **Herramienta principal:** Google Antigravity IDE (Pair Programming Assistant).
* **Modelo utilizado:** Gemini 3.8 Flash (High) - Configuración de razonamiento y generación de código de alta precisión.
* **Tipo de cuenta / Plan:** Cuenta institucional / Antigravity Developer Suite.

## 2. Prompts Utilizados.

** 1.- "Necesito actualizar este proyecto e incluir todo lo que se pide en este informe."
** Respuesta de IA: Se ha implementado de forma integral todo lo solicitado en las especificaciones del Trabajo 2: Frontend, consumo de API y seguridad para el caso de negocio del Taller Mecánico.

** 2.- "Necesito subir esto a un nuevo repositorio de GitHub"
** Respuesta de IA: El proyecto completo (Backend .NET, Frontend React 19, pruebas automatizadas, informes y evidencias) ya está consolidado y listo en tu repositorio Git local en la rama main.(Luego se entregaron pasos a seguir de como lograrlo de manera ordenada)

** 3.- "Actualiza el nuevo repositorio con los cambios realizados."
** Respuesta de IA: El repositorio en GitHub ha sido actualizado exitosamente.
Enlace al Repositorio
https://github.com/tomasolivos/taller-mecanico

** 4.- "necesito obtener estos errores Evidencia de verificación de seguridad: capturas o registros que muestren los controles funcionando (respuestas 401 y 403, bloqueo por CORS, entrada maliciosa neutralizada, límite de tasa) y el reporte de auditoría de dependencias (npm audit o equivalente)."
** Respuesta de IA: Entrego una serie de comandos a realizar para poder obtener las capturas de pantalla enviadas en el archivo Word con las evidencias.

** 5.- Se solicito un comando para realizar este test: 
** Respuesta de IA:  El comando equivalente para realizar la prueba es: 
dotnet test TallerMecanico/TallerMecanico.csproj

** 6.- Uno de las ultimas consultas que se realizo al modelo de antigravity fue pedir forzar el error 403 Forbidden, al realizar los cambios sugeridos el proyecto comenzo a presentar fallos por lo cual se ignoro su respuesta.



## 3. Registro Complementario de Prompts de Asistencia Técnica

**Fecha:** 25 de octubre de 2026  
**Herramienta:** Copilot SDK en VS Code  
**Alcance:** Solicitudes realizadas durante esta sesión de soporte al proyecto.

### 3.1 Corrección del inicio de sesión
* **Prompt:**
  > *"Arregla el error de autenticación que me da al intentar logear."*
* **Respuesta y acciones:** Se identificó que la pantalla sugería cuentas de demostración que no se creaban en la base de datos. Se añadió su provisión idempotente solo en entorno `Development`, se reutilizó el servicio de verificación de contraseñas y se agregaron pruebas de integración.
* **Resultado:** Las pruebas de integración del backend pasaron (5/5).

### 3.2 Acción de eliminación para el rol Mecánico
* **Prompt:**
  > *"Necesito que habilites el botón de eliminar orden de trabajo para el mecánico; al intentar eliminar algo debe arrojar el error 403 - forbidden."*
* **Respuesta y acciones:** Se habilitó la acción en la tabla, tarjetas móviles y detalle de la orden para todos los roles. La autorización del endpoint se mantuvo exclusivamente para `Admin`; se actualizó la prueba de interfaz para verificar el aviso de 403 y la prueba de integración para comprobar la respuesta `Forbidden` del backend.
* **Resultado:** Las pruebas del frontend y del backend pasaron (5/5 cada una); el frontend también compiló correctamente.
