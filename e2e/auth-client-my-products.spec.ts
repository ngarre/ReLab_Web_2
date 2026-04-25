// Le digo a TypeScript que use también los tipos de Node.
// Esto permite, por ejemplo, que process.env no dé error.
/// <reference types="node" />

// Importo las utilidades principales de Playwright:
// - test para definir suites y casos
// - expect para hacer comprobaciones
import { test, expect } from '@playwright/test';

// Leo desde variables de entorno las credenciales del cliente de prueba.
// Así no dejo usuario y contraseña fijos dentro del archivo.
const clientNickname = process.env.PLAYWRIGHT_CLIENT_NICKNAME;
const clientPassword = process.env.PLAYWRIGHT_CLIENT_PASSWORD;

// Agrupo este conjunto de tests bajo el nombre "flujo cliente autenticado" --> por ahora solo tengo un test
test.describe('flujo cliente autenticado', () => {

  // Si no existen credenciales necesarias en variables de entorno, salta el test
  test.skip(
    !clientNickname || !clientPassword,
    'Faltan las variables PLAYWRIGHT_CLIENT_NICKNAME y PLAYWRIGHT_CLIENT_PASSWORD'
  );

  // Defino el caso de prueba principal
  // "page" es la pestaña del navegador controlada por Playwright --> con ella puedo: navegar, escribir, hacer clic, comprobar textos y elementos
  test('permite iniciar sesion y acceder a Mis productos', async ({ page }) => { 
    // Le digo que vaya a página de login (la baseURL la cojo de la configuración de Playwright)
    await page.goto('/login');

    // Busco campo etiquetado como "nickname" y escribo el nickname del cliente (La exclamación final le dice a TypeScript que habrá valor, se cumplirá porque ya he protegido antes con test.skip)
    await page.getByLabel(/nickname/i).fill(clientNickname!);
    // Hago lo mismo con el campo de contraseña
    await page.getByLabel(/contraseña/i).fill(clientPassword!);
    // Hago clic en el botón de Entrar
    await page.getByRole('button', { name: /entrar/i }).click();

    // Espero a que la página termine sus peticiones de red tras el login
    // antes de comprobar si ha habido error o redirección.
    await page.waitForLoadState('networkidle');

    // Aquí selecciono un posible mensaje de error de login
    const loginError = page.getByRole('alert');

    // Si el mensaje de error de login está visible, leo su texto y lanzo un error manual con ese contenido
    if (await loginError.isVisible()) {
      throw new Error(`El login ha fallado: ${await loginError.innerText()}`);
    }

    // Aquí compruebo que después del login, la página ya no sigue en /login
    await expect(page).not.toHaveURL(/\/login$/);

    // Navego a la ruta protegida "Mis Productos"
    await page.goto('/my-products');

    // Compruebo que estoy en la URL esperada
    await expect(page).toHaveURL(/\/my-products$/);

    // Compruebo que el título principal de la página está visible --> compruebo que se ha renderizado bien 
    await expect(page.getByRole('heading', { name: /mis productos/i })).toBeVisible();

    // Compruebo que además aparece el enlace "Crear Producto"
    await expect(page.getByRole('link', { name: /crear producto/i })).toBeVisible();
  });
});