/// <reference types="node" />
import { test, expect } from '@playwright/test';

const clientNickname = process.env.PLAYWRIGHT_CLIENT_NICKNAME;
const clientPassword = process.env.PLAYWRIGHT_CLIENT_PASSWORD;

test.describe('restricciones por rol para cliente', () => {
    test.skip(
        !clientNickname || !clientPassword,
        'Faltan las variables PLAYWRIGHT_CLIENT_NICKNAME y PLAYWRIGHT_CLIENT_PASSWORD'
    );

    test('un cliente no puede acceder a la gestion de usuarios', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel(/nickname/i).fill(clientNickname!);
        await page.getByLabel(/contraseña/i).fill(clientPassword!);
        await page.getByRole('button', { name: /entrar/i }).click();

        await page.waitForLoadState('networkidle');

        const loginError = page.getByRole('alert');
        if (await loginError.isVisible()) {
            throw new Error(`El login ha fallado: ${await loginError.innerText()}`);
        }

        await expect(page).not.toHaveURL(/\/login$/);

        await page.goto('/users');

        await expect(page).toHaveURL(/\/$/);
        await expect(
            page.getByRole('heading', { name: /nuestros productos/i })
        ).toBeVisible();
    });
});