import { describe, expect, it } from 'vitest';
import {
    getAccountTypeLabel,
    isCentroPublico,
    normalizeAccountType,
} from './user';

describe('user utils', () => {
    describe('normalizeAccountType', () => {
        it('normaliza espacios y mayúsculas', () => {
            expect(normalizeAccountType('  EMPRESA  ')).toBe('empresa');
        });

        it('devuelve cadena vacía si no recibe valor', () => {
            expect(normalizeAccountType(undefined)).toBe('');
            expect(normalizeAccountType(null)).toBe('');
        });
    });

    describe('isCentroPublico', () => {
        it('detecta centro_publico', () => {
            expect(isCentroPublico('centro_publico')).toBe(true);
        });

        it('detecta centro público con espacio', () => {
            expect(isCentroPublico('Centro Público')).toBe(true);
        });

        it('devuelve false para otros tipos', () => {
            expect(isCentroPublico('empresa')).toBe(false);
            expect(isCentroPublico('particular')).toBe(false);
        });
    });

    describe('getAccountTypeLabel', () => {
        it('devuelve EMPRESA si el tipo es empresa', () => {
            expect(getAccountTypeLabel('empresa')).toBe('EMPRESA');
        });

        it('devuelve CENTRO PÚBLICO si corresponde', () => {
            expect(getAccountTypeLabel('centro_publico')).toBe('CENTRO PÚBLICO');
            expect(getAccountTypeLabel('Centro Público')).toBe('CENTRO PÚBLICO');
        });

        it('devuelve PARTICULAR por defecto', () => {
            expect(getAccountTypeLabel('particular')).toBe('PARTICULAR');
            expect(getAccountTypeLabel(undefined)).toBe('PARTICULAR');
        });
    });
});