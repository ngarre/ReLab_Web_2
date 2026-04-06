/*URL base del backend (API de Spring Boot).*/
const BASE_URL = "http://localhost:8080";

/**
 * Función genérica para realizar peticiones HTTP GET.
 * <T> es un "Type Parameter": permite que quien llame a la función decida qué tipo 
 * de datos espera recibir (un Producto, un Usuario o una Categoría.).
 * el parámetro endpoint es la ruta del recurso (ej: "productos", "usuarios")
 * La función devuelve una Promesa que resuelve al tipo de dato especificado <T>
 */
export async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    // Realiza la petición combinando la URL base y el recurso solicitado
    const response = await fetch(`${BASE_URL}/${endpoint}`);

    // Verificamos si la respuesta es exitosa (status 200-299)
    if (!response.ok) {
      // Si el servidor responde con error (ej. 404 o 500), lanzamos una excepción
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    // Convertimos la respuesta de JSON a un objeto TypeScript
    return await response.json();

  } catch (error) {
    // Registramos cualquier error (de red o del servidor) en la consola para depuración
    console.error("API fetch error:", error);
    // Re-lanzamos la excepción para que el componente (Frontend) decida qué mensaje 
    // genérico mostrar al usuario final (ej: "Error al cargar los datos").
    throw error;
  }
}
