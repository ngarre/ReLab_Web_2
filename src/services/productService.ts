import { fetchAPI } from '../utils/api';
import type { Product } from '../types/Product';
import type { ProductUpdate } from '../types/ProductUpdate';

export async function getProducts(): Promise<Product[]> {
  return fetchAPI<Product[]>('productos');
}

export async function getProductById(productId: number): Promise<Product> {
  return fetchAPI<Product>(`productos/${productId}`);
}

export async function updateProduct(
  productId: number,
  data: ProductUpdate,
  token: string
): Promise<Product> {
  return fetchAPI<Product>(`productos/${productId}`, {
    method: 'PUT',
    body: data,
    token,
  });
}

export async function deleteProduct(productId: number, token: string): Promise<void> {
  return fetchAPI<void>(`productos/${productId}`, {
    method: 'DELETE',
    token,
  });
}