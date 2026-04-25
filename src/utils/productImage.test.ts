// Importo utilidades de Vitest:
// - describe para agrupar tests
// - it para definir cada caso
// - expect para comprobar resultados
// - vi para crear mocks
import { describe, expect, it, vi } from 'vitest';

// Mock del placeholder para no depender del archivo real en el test
vi.mock('../assets/images/placeholder-default.jpg', () => ({
  default: 'placeholder-mock.jpg', // Hace falta esta propiedad porque se importa con Import con defecto (por ser una imagen), no con importación nombrada (llaves {})
}));

// Mock de BASE_URL para que el resultado sea siempre el mismo
vi.mock('./api', () => ({
  BASE_URL: 'http://localhost:8080',
}));

// Importo la función que quiero probar
import { getProductImageUrl } from './productImage';

// Agrupo todos los tests de esta utilidad bajo el nombre getProductImageUrl
describe('getProductImageUrl', () => {

  // Caso 1.
  // Si no hay imagePath, devuelve el placeholder.
  it('devuelve el placeholder si no recibe ruta de imagen', () => {
    expect(getProductImageUrl(undefined)).toBe('placeholder-mock.jpg');
    expect(getProductImageUrl(null)).toBe('placeholder-mock.jpg');
    expect(getProductImageUrl('')).toBe('placeholder-mock.jpg');
  });

  // Caso 2.
  // Si la imagen falla, devuelve el placeholder
  it('devuelve el placeholder si la imagen ha fallado', () => {
    expect(getProductImageUrl('/uploads/producto.jpg', true)).toBe('placeholder-mock.jpg');
  });

  // Caso 3.
  // Si hay ruta y no falla la imagen --> debe construir la URL final
  it('construye la URL completa si recibe ruta válida y no hay error', () => {
    expect(getProductImageUrl('/uploads/producto.jpg')).toBe(
      'http://localhost:8080/uploads/producto.jpg'
    );
  });
});