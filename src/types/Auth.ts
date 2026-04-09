import type { UserRole } from './User';

export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface RegisterRequest {
  nickname: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento?: string;
  cuentaActiva: boolean;
  tipoUsuario: string;
  saldo: number;
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
}