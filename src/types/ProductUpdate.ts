export interface ProductUpdate {
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  categoriaId: number | null;
  modo?: boolean; // Va a estar oculto para el usuario, pero me permite conservarlo al enviar
  imagen?: string | null;
}