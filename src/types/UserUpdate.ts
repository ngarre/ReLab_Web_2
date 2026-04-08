export interface UserUpdate {
  nickname?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  fechaNacimiento?: string;
  cuentaActiva?: boolean;
  tipoUsuario?: string;
  latitud?: number | null;
  longitud?: number | null;
  direccion?: string | null;
}