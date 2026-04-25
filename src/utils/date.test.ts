// Importo funciones de Vitest:
// - describe para agrupar tests relacionados
// - it para definir cada caso de prueba individual
// - expect para hacer las comprobaciones
import { describe, expect, it } from 'vitest';

// Importo la función que quiero probar
import { formatSpanishDate } from './date';

// Agrupo todos los tests de esta utilidad bajo el nombre "formatSpanishDate"
describe('formatSpanishDate', () => {

    // Primer caso de prueba:
    // comprueba que una fecha simple en formato yyyy-MM-dd
    // se transforma correctamente a formato legible en español
    it('formatea una fecha yyyy-MM-dd en español', () => {

        // Llamo a la función con una fecha válida
        const result = formatSpanishDate('2026-04-12');

        // Compruebo que el resultado sea exactamente el esperado
        expect(result).toBe('12 de abril de 2026');
    });


    // Segundo caso:
    // comprueba que también funciona si la fecha viene en formato ISO con hora
    it('formatea una fecha ISO con hora', () => {
        // Llamo a la función con fecha + hora
        const result = formatSpanishDate('2026-04-12T10:30:00');

        // Espero que la función ignore la parte de hora
        // y devuelva solo la fecha en español
        expect(result).toBe('12 de abril de 2026');
    });


     // Tercer caso:
    // comprueba qué pasa si no se recibe una fecha usable
    it('devuelve el fallback si no recibe fecha', () => {

        // Si recibe string vacío, debería devolver el fallback
        expect(formatSpanishDate('')).toBe('No disponible');

        // Si recibe undefined, también debería devolver el fallback
        expect(formatSpanishDate(undefined)).toBe('No disponible');

        // Si recibe null, igual
        expect(formatSpanishDate(null)).toBe('No disponible');
    });


    // Cuarto caso:
    // comprueba qué pasa si el texto recibido no se puede interpretar como fecha válida
    it('devuelve el texto original si la fecha no es válida', () => {
        // Uso una cadena que no representa una fecha real
        const result = formatSpanishDate('fecha-rara');

        // Espero que la función no rompa ni invente nada,
        // sino que devuelva el texto original
        expect(result).toBe('fecha-rara');
    });
});