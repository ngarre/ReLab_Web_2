import { fetchAPI } from '../utils/api';
import type { Product } from '../types/Product';

export async function getProducts(): Promise<Product[]> {
  return fetchAPI<Product[]>('productos');
}