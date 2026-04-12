import { describe, expect, it } from 'vitest';
import { formatSpanishDate } from './date';

describe('formatSpanishDate', () => {
    it('formatea una fecha yyyy-MM-dd en español', () => {
        const result = formatSpanishDate('2026-04-12');

        expect(result).toBe('12 de abril de 2026');
    });

    it('formatea una fecha ISO con hora', () => {
        const result = formatSpanishDate('2026-04-12T10:30:00');

        expect(result).toBe('12 de abril de 2026');
    });

    it('devuelve el fallback si no recibe fecha', () => {
        expect(formatSpanishDate('')).toBe('No disponible');
        expect(formatSpanishDate(undefined)).toBe('No disponible');
        expect(formatSpanishDate(null)).toBe('No disponible');
    });

    it('devuelve el texto original si la fecha no es válida', () => {
        const result = formatSpanishDate('fecha-rara');

        expect(result).toBe('fecha-rara');
    });
});