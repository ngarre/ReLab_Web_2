// Importo funciones de Vitest:
// - describe para agrupar bloques de tests
// - it para definir casos concretos
// - expect para hacer comprobaciones
import { describe, expect, it } from 'vitest';

// Importo las utilidades que quiero probar
import {
    getAccountTypeLabel,
    isCentroPublico,
    normalizeAccountType,
} from './user';

// Agrupo todos los tests de estas utilidades bajo un bloque general
describe('user utils', () => {

    // Bloque de tests para normalizeAccountType
    describe('normalizeAccountType', () => {

        // Caso 1:
        // comprueba que elimina espacios sobrantes y pasa el texto a minúsculas
        it('normaliza espacios y mayúsculas', () => {
            expect(normalizeAccountType('  EMPRESA  ')).toBe('empresa');
        });

        // Caso 2:
        // comprueba que si no recibe valor útil, devuelve cadena vacía
        it('devuelve cadena vacía si no recibe valor', () => {
            expect(normalizeAccountType(undefined)).toBe('');
            expect(normalizeAccountType(null)).toBe('');
        });
    });


    // Bloque de tests para isCentroPublico
    describe('isCentroPublico', () => {

        // Caso 1:
        // detecta correctamente el formato con guion bajo
        it('detecta centro_publico', () => {
            expect(isCentroPublico('centro_publico')).toBe(true);
        });

        // Caso 2:
        // detecta también la variante con espacio y mayúsculas
        it('detecta centro público con espacio', () => {
            expect(isCentroPublico('Centro Público')).toBe(true);
        });

        // Caso 3:
        // comprueba que otros tipos no se identifican como centro público
        it('devuelve false para otros tipos', () => {
            expect(isCentroPublico('empresa')).toBe(false);
            expect(isCentroPublico('particular')).toBe(false);
        });
    });


    // Bloque de tests para getAccountTypeLabel
    describe('getAccountTypeLabel', () => {
        // Caso 1:
        // si el tipo es empresa, devuelve la etiqueta EMPRESA
        it('devuelve EMPRESA si el tipo es empresa', () => {
            expect(getAccountTypeLabel('empresa')).toBe('EMPRESA');
        });

        // Caso 2:
        // si corresponde a centro público, devuelve la etiqueta normalizada y en mayúsculas
        it('devuelve CENTRO PÚBLICO si corresponde', () => {
            expect(getAccountTypeLabel('centro_publico')).toBe('CENTRO PÚBLICO');
            expect(getAccountTypeLabel('Centro Público')).toBe('CENTRO PÚBLICO');
        });

        // Caso 3:
        // para particular o valores ausentes, usa PARTICULAR como salida por defecto
        it('devuelve PARTICULAR por defecto', () => {
            expect(getAccountTypeLabel('particular')).toBe('PARTICULAR');
            expect(getAccountTypeLabel(undefined)).toBe('PARTICULAR');
        });
    });
});