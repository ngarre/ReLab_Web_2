/*URL base del backend (API de Spring Boot).*/
// Defino la URL base que usa el frontend para llamar a la API.
// Primero intenta leerla desde la variable de entorno VITE_API_URL.
// Si no existe, uso por defecto http://localhost:8080
export const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080';

 // Defino un tipo para limitar los métodos HTTP permitidos.
 // Así TypeScript evita que escriba métodos no contemplados por error.
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';


 // Interfaz que describe los datos opcionales que puede recibir fetchAPI.
 // method: método HTTP a usar
 // body: datos que se enviarán en el cuerpo de la petición
 // token: JWT opcional para endpoints protegidos
interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
}


 // Función genérica reutilizable para hacer peticiones a la API.
 // <T> significa que el tipo de dato devuelto será configurable.
 // Por ejemplo:
 // - fetchAPI<User>(...)
 // - fetchAPI<Product[]>(...)
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
   // Extraigo las opciones recibidas.
   // Si no se pasa method, por defecto será GET.
  const { method = 'GET', body, token } = options;

   // Creo el objeto de cabeceras HTTP.
   // Por defecto indico que el contenido enviado será JSON.
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

   // Si me pasan un token, añado la cabecera Authorization
   // con formato Bearer, que es lo esperado para JWT.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

   // Construyo la configuración base de la petición fetch.
   // Incluye el método HTTP y las cabeceras.
  const config: RequestInit = {
    method,
    headers,
  };

   // Si me pasan body, lo convierto a JSON antes de enviarlo.
   // Esto permite mandar objetos JS al backend como JSON.
  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  try {
     // Lanzo la petición real al backend.
     // Concateno la URL base con el endpoint recibido.
    const response = await fetch(`${BASE_URL}/${endpoint}`, config);

    // Si la respuesta HTTP no es correcta (por ejemplo 400, 401, 404, 500),
    // entro en este bloque.
    if (!response.ok) {
       // Intento leer el texto del error devuelto por el backend.
      const errorText = await response.text();
       // Lanzo un Error de JavaScript con el mensaje devuelto por el backend.
       // Si el backend no devuelve texto, construyo un mensaje genérico con status y statusText.
      throw new Error(
        errorText || `HTTP ${response.status} - ${response.statusText}`
      );
    }

     // Si la respuesta es 204 No Content, significa que no viene body.
     // Como la función es genérica y espera devolver T, aquí devuelvo undefined
     // convertido al tipo T para no romper el contrato.
    if (response.status === 204) {
      return undefined as T;
    }

     // Si todo ha ido bien y hay contenido, lo parseo como JSON y lo devuelvo.
    return await response.json();
  } catch (error) {
     // Si falla cualquier parte del proceso:
     // - error de red
     // - fetch bloqueado
     // - backend caído
     // - error lanzado arriba con !response.ok
     // lo registro en consola para depuración.
    console.error('API fetch error:', error);
     // Y lo relanzo para que el servicio o componente que llamó a fetchAPI
     // pueda manejarlo.
    throw error;
  }
}
