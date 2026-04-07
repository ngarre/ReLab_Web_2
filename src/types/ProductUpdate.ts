export interface ProductUpdate {
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  categoriaId: number | null;
}