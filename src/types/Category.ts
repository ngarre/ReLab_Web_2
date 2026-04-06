export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  fechaCreacion: string; // llega como string "yyyy-MM-dd"
  activa: boolean;
  tasaComision: number;
}
