// Importa una imagen local que se usará como imagen por defecto.
// Se mostrará cuando el producto no tenga imagen o cuando falle la carga.
import PlaceholderImage from '../assets/images/placeholder-default.jpg';

// Importa la URL base de la API/backend.
import { BASE_URL } from './api';

/**
 * Devuelve la URL de la imagen de un producto.
 *
 * Si el producto no tiene imagen, o si la imagen dio error al cargar,
 * devuelve una imagen placeholder local.
 *
 * imagePath - Ruta relativa de la imagen del producto recibida desde la API.
 *                    Ejemplo: "/productos/1/imagen"
 *
 * hasImageError - Indica si hubo un error al intentar cargar la imagen.
 *                        Por defecto es false.
 *
 * Finalmente se devuelve La URL completa de la imagen del producto (http://localhost:8080/productos/1/imagen) o la imagen placeholder.
 */

export function getProductImageUrl(
    imagePath?: string | null,
    hasImageError = false
): string {
    // Si no existe imagePath, o si la imagen falló al cargar,
    // usamos la imagen por defecto.
    if (!imagePath || hasImageError) {
        return PlaceholderImage;
    }

    // Si sí hay una imagen válida, construimos la URL completa
    // juntando la URL base del backend con la ruta de la imagen.
    return `${BASE_URL}${imagePath}`;
}