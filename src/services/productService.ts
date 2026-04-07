import { fetchAPI } from '../utils/api';
import type { Product } from '../types/Product';

export async function getProducts(): Promise<Product[]> {
  return fetchAPI<Product[]>('productos');
}

export async function deleteProduct(productId: number, token: string): Promise<void> {
  return fetchAPI<void>(`productos/${productId}`, {
    method: 'DELETE',
    token,
  });
}