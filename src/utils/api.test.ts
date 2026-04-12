import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAPI } from './api';

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);

describe('fetchAPI', () => {
    beforeEach(() => {
        fetchMock.mockReset();
    });

    it('hace una petición GET por defecto', async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ ok: true }),
        });

        const result = await fetchAPI('usuarios');

        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8080/usuarios',
            expect.objectContaining({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        );

        expect(result).toEqual({ ok: true });
    });

    it('añade token y body cuando se le pasan', async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ created: true }),
        });

        const payload = { nombre: 'Microscopio' };

        await fetchAPI('productos', {
            method: 'POST',
            body: payload,
            token: 'fake-token',
        });

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

    it('devuelve undefined cuando la respuesta es 204', async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 204,
        });

        const result = await fetchAPI('productos/1', {
            method: 'DELETE',
        });

        expect(result).toBeUndefined();
    });

    it('lanza un error con el texto devuelto por el backend si la respuesta falla', async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            text: vi.fn().mockResolvedValue('Error de validación'),
        });

        await expect(fetchAPI('usuarios')).rejects.toThrow('Error de validación');
    });
});