export interface ProductFormData {
  nombre: string;
  descripcion: string;
  precio: string;
  activo: boolean;
  categoriaId: string;
  imagen?: string | null;
}