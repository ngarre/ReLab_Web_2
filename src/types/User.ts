export type UserRole = 'ADMIN' | 'GESTOR' | 'CLIENTE';

export interface User {
  id: number;
  nickname: string;
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string; // "yyyy-MM-dd"
  cuentaActiva: boolean;
  fechaAlta: string;       // "yyyy-MM-dd"
  tipoUsuario: string;
  role: UserRole;
  saldo: number | null;
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
}
