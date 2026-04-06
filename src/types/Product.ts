import type { CategorySimple } from "./CategorySimple";
import type { UserSimple } from "./UserSimple";

export interface Product {
  id: number;
  nombre: string;           
  descripcion: string;      
  precio: number;           
  fechaActualizacion: string;
  activo: boolean;
  modo: boolean;
  imagenUrl: string;
  categoria: CategorySimple;
  usuario: UserSimple;
}

