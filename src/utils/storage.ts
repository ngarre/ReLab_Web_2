// Importo el tipo UserRole para que TypeScript sepa
// qué tipo de valor puede tener la propiedad role.
import type { UserRole } from '../types/User';

// Defino la estructura de una sesión guardada en localStorage.
// En este proyecto la sesión persistida guarda:
// - token JWT
// - role del usuario
export interface AuthSession {
  token: string;
  role: UserRole;
}

// Defino una constante con la clave que usaré en localStorage.
// Así no repito el string 'auth_session' en varios sitios
// y evito errores de escritura.
const AUTH_STORAGE_KEY = 'auth_session';

// Función para guardar la sesión en localStorage.
// Recibe un objeto con token y role.
// Luego lo convierte a JSON porque localStorage solo almacena strings.
export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

// Función para recuperar la sesión guardada.
// Puede devolver:
// - un objeto AuthSession si existe y es válido
// - null si no hay sesión o si está corrupta
export function getAuthSession(): AuthSession | null {
  // Intento leer el valor guardado en localStorage con la clave AUTH_STORAGE_KEY.
  const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);

  // Si no existe nada guardado, devuelvo null.
  // Eso significa "no hay sesión persistida".
  if (!storedSession) {
    return null;
  }

  try {
    // Si sí existe algo, intento convertirlo de string JSON a objeto.
    // Si todo va bien, lo devuelvo tipado como AuthSession.
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    // Si el JSON está mal formado o corrupto,
    // elimino la clave del localStorage para limpiar el estado
    // y devuelvo null para indicar que no hay una sesión usable.
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

// Función para borrar la sesión guardada.
// Se usa al hacer logout o cuando una sesión restaurada falla.
export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}