export interface ProductCreate {
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  categoriaId: number;
  usuarioId: number;
  modo: boolean;
  imagen?: string | null;
}