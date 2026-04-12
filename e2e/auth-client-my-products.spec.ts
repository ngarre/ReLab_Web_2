/// <reference types="node" />
import { test, expect } from '@playwright/test';

const clientNickname = process.env.PLAYWRIGHT_CLIENT_NICKNAME;
const clientPassword = process.env.PLAYWRIGHT_CLIENT_PASSWORD;

test.describe('flujo cliente autenticado', () => {
  test.skip(
    !clientNickname || !clientPassword,
    'Faltan las variables PLAYWRIGHT_CLIENT_NICKNAME y PLAYWRIGHT_CLIENT_PASSWORD'
  );

  test('permite iniciar sesion y acceder a Mis productos', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/nickname/i).fill(clientNickname!);
    await page.getByLabel(/contraseña/i).fill(clientPassword!);
    await page.getByRole('button', { name: /entrar/i }).click();

    // Si sigue en login, queremos ver claramente el error
    await page.waitForLoadState('networkidle');

    const loginError = page.getByRole('alert');

    if (await loginError.isVisible()) {
      throw new Error(`El login ha fallado: ${await loginError.innerText()}`);
    }

    await expect(page).not.toHaveURL(/\/login$/);

    await page.goto('/my-products');

    await expect(page).toHaveURL(/\/my-products$/);
    await expect(page.getByRole('heading', { name: /mis productos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /crear producto/i })).toBeVisible();
  });
});