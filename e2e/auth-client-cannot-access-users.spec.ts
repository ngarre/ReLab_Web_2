// Le digo a TypeScript que incluya tipos de Node.
// Esto permite usar process.env sin errores de tipado.
/// <reference types="node" />

// Importo las utilidades principales de Playwright:
// - test para definir suites y casos
// - expect para hacer comprobaciones
import { test, expect } from '@playwright/test';

// Leo las credenciales del cliente de prueba desde variables de entorno.
// Así no dejo usuario y contraseña fijos en el código.
const clientNickname = process.env.PLAYWRIGHT_CLIENT_NICKNAME;
const clientPassword = process.env.PLAYWRIGHT_CLIENT_PASSWORD;

// Agrupo este conjunto de tests (solo tengo un test) bajo una suite que describe
// que se van a comprobar restricciones por rol para un cliente.
test.describe('restricciones por rol para cliente', () => {

    // El test salta automáticamente si no defino las variables de entorno necesarias
    test.skip(
        !clientNickname || !clientPassword,
        'Faltan las variables PLAYWRIGHT_CLIENT_NICKNAME y PLAYWRIGHT_CLIENT_PASSWORD'
    );

    // Defino caso concreto de prueba: cliente puede iniciar sesión, pero no acceder a /users
    test('un cliente no puede acceder a la gestion de usuarios', async ({ page }) => {
        // Llevo el navegador a la pantalla de login
        await page.goto('/login');

        // Busco input etiquetado como "nickmane" y escribo el nickname del cliente
        await page.getByLabel(/nickname/i).fill(clientNickname!);
        // Hago lo mismo con la contraseña
        await page.getByLabel(/contraseña/i).fill(clientPassword!);
        // Clico en Entrar
        await page.getByRole('button', { name: /entrar/i }).click();

        // Espero a que la aplicación termine sus peticiones de red tras el login antes de seguir comprobando.
        await page.waitForLoadState('networkidle');

        // Si el login falla, espero que la app lo muestre como un elemento accesible con rol alert.
        const loginError = page.getByRole('alert');
        // Si el mensaje de error está visible: leo su contenido y lanzo error manual con ese texto
        if (await loginError.isVisible()) {
            throw new Error(`El login ha fallado: ${await loginError.innerText()}`);
        }

        // Compruebo que tras el login ya no sigo en la ruta /login
        await expect(page).not.toHaveURL(/\/login$/);

        // Hago intento de acceso a la ruta restringida
        await page.goto('/users');

        // Compruebo que después del intento de acceso acabo en la raíz "/"
        await expect(page).toHaveURL(/\/$/);
        // No solo miro URL, sino que también verifico que la pantalla que se renderiza es la de inicio, ya que aparece título de "Nuestros Productos"
        await expect(
            page.getByRole('heading', { name: /nuestros productos/i })
        ).toBeVisible();
    });
});