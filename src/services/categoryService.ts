import { fetchAPI } from '../utils/api';
import type { Category } from '../types/Category';
import type { CategoryCreate } from '../types/CategoryCreate';
import type { CategoryUpdate } from '../types/CategoryUpdate';

export async function getCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>('categorias');
}

export async function getCategoryById(categoryId: number): Promise<Category> {
  return fetchAPI<Category>(`categorias/${categoryId}`);
}

export async function createCategory(
  data: CategoryCreate,
  token: string
): Promise<Category> {
  return fetchAPI<Category>('categorias', {
    method: 'POST',
    body: data,
    token,
  });
}

export async function updateCategory(
  categoryId: number,
  data: CategoryUpdate,
  token: string
): Promise<Category> {
  return fetchAPI<Category>(`categorias/${categoryId}`, {
    method: 'PUT',
    body: data,
    token,
  });
}

export async function deleteCategory(categoryId: number, token: string): Promise<void> {
  return fetchAPI<void>(`categorias/${categoryId}`, {
    method: 'DELETE',
    token,
  });
}