import { fetchAPI } from '../utils/api';
import type { Category } from '../types/Category';
import type { CategoryCreate } from '../types/CategoryCreate';

export async function getCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>('categorias');
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