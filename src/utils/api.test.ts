// Importo utilidades de Vitest:
// - beforeEach para ejecutar lógica antes de cada test
// - describe para agrupar tests
// - expect para hacer comprobaciones
// - it para definir casos concretos
// - vi para mocks y stubs
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Importo la función que quiero probar
import { fetchAPI } from './api';

// Creo una función mock que simulará a fetch.
// No llamará al fetch real del navegador.
const fetchMock = vi.fn();

// Sustituyo el fetch global por mi mock.
// Así, cuando fetchAPI haga fetch(...), en realidad usará fetchMock en vez de llamar al backend
vi.stubGlobal('fetch', fetchMock);

// Agrupo todos los tests de fetchAPI
describe('fetchAPI', () => {

    // Antes de cada test, reseteo el mock para:
    // - limpiar llamadas anteriores
    // - limpiar implementaciones previas
    // y que cada test empiece "limpio"
    beforeEach(() => {
        fetchMock.mockReset();
    });


    // Caso 1:
    // comprueba que si no se pasa method, la función usa GET por defecto
    it('hace una petición GET por defecto', async () => {

        // Simulo una respuesta exitosa del backend
        // como si fetch devolviera status 200 y un json { ok: true }
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ ok: true }),
        });

        // Llamo a la función con el endpoint "usuarios"
        const result = await fetchAPI('usuarios');

        // Compruebo que fetch se llamó con:
        // - la URL base + endpoint
        // - method GET
        // - header Content-Type JSON
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8080/usuarios',
            expect.objectContaining({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        );

        // Compruebo que fetchAPI devuelve el JSON parseado
        expect(result).toEqual({ ok: true });
    });


    // Caso 2:
    // comprueba que si se pasan body y token,
    // la función los incorpora correctamente a la petición
    it('añade token y body cuando se le pasan', async () => {
        
        // Simulo una respuesta exitosa de creación
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ created: true }),
        });

        // Preparo un objeto que simulará el body enviado al backend
        const payload = { nombre: 'Microscopio' };

        // Llamo a fetchAPI con:
        // - endpoint productos
        // - método POST
        // - body con payload
        // - token JWT falso
        await fetchAPI('productos', {
            method: 'POST',
            body: payload,
            token: 'fake-token',
        });

        // Compruebo que fetch recibió:
        // - la URL correcta
        // - método POST
        // - body serializado a JSON
        // - Content-Type
        // - cabecera Authorization con Bearer
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8080/productos',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer fake-token',
                },
            })
        );
    });

    // Caso 3:
    // comprueba el comportamiento especial cuando el backend devuelve 204 No Content
    it('devuelve undefined cuando la respuesta es 204', async () => {
       // Simulo una respuesta correcta sin contenido
        fetchMock.mockResolvedValue({
            ok: true,
            status: 204,
        });

        // Llamo a fetchAPI como si fuera un DELETE
        const result = await fetchAPI('productos/1', {
            method: 'DELETE',
        });

        // Espero que la función devuelva undefined
        // porque no hay body JSON que parsear
        expect(result).toBeUndefined();
    });

    // Caso 4:
    // comprueba que si la respuesta falla,
    // fetchAPI lanza el texto de error devuelto por el backend
    it('lanza un error con el texto devuelto por el backend si la respuesta falla', async () => {
        // Simulo una respuesta fallida del backend
        // con status 400 y texto de error "Error de validación"
        fetchMock.mockResolvedValue({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            text: vi.fn().mockResolvedValue('Error de validación'),
        });

        // Compruebo que la promesa se rechaza y que el mensaje del error
        // contiene el texto devuelto por el backend
        await expect(fetchAPI('usuarios')).rejects.toThrow('Error de validación');
    });
});