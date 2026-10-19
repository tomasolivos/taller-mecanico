import { test, expect } from '@playwright/test';

test.describe('Flujo End-to-End Taller Mecánico', () => {
  test('Login exitoso, visualización de órdenes protegidas y creación de nueva orden', async ({ page }) => {
    // 1. Acceder a la ruta raíz (debe redirigir al Login por ProtectedRoute)
    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /taller mecánico/i })).toBeVisible();

    // 2. Usar credenciales de demostración de Admin
    await page.getByRole('button', { name: /rol admin/i }).click();
    await expect(page.getByLabelText(/nombre de usuario/i)).toHaveValue('admin');

    // 3. Iniciar Sesión
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // 4. Verificar redirección a /ordenes y badge de rol
    await expect(page).toHaveURL(/.*ordenes/);
    await expect(page.getByRole('heading', { name: /órdenes de trabajo/i })).toBeVisible();
    await expect(page.getByText('admin', { exact: false })).toBeVisible();

    // 5. Abrir Modal de Creación
    const nuevaOrdenBtn = page.getByRole('button', { name: /nueva orden/i });
    await expect(nuevaOrdenBtn).toBeVisible();
    await nuevaOrdenBtn.click();

    // 6. Verificar apertura de diálogo accesible
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('heading', { name: /crear nueva orden de trabajo/i })).toBeVisible();

    // 7. Diligenciar campos del formulario
    await page.getByLabelText(/cliente/i).selectOption({ index: 1 });
    await page.getByLabelText(/vehículo/i).selectOption({ index: 1 });
    await page.getByLabelText(/mecánico asignado/i).selectOption({ index: 1 });
    await page.getByLabelText(/observaciones y diagnóstico/i).fill('Prueba E2E Automatizada - Diagnóstico y ajuste integral');

    // 8. Enviar formulario
    await page.getByRole('button', { name: /crear orden/i }).click();

    // 9. Verificar que el modal se cierra y aparece notificación de éxito
    await expect(modal).not.toBeVisible();
    await expect(page.getByText(/orden creada|registrada exitosamente/i)).toBeVisible();

    // 10. Cerrar sesión
    await page.getByRole('button', { name: /salir/i }).click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('Seguridad OWASP: Intento de acceso sin token es bloqueado', async ({ page }) => {
    // Limpiar sessionStorage y acceder a /ordenes directamente
    await page.goto('/ordenes');
    await expect(page).toHaveURL(/.*login/);
  });

  test('Diseño responsivo móvil: Viewport de 360px sin desbordamiento horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/login');

    // Comprobar que no hay scroll horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});

