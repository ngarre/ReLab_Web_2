import { fetchAPI } from '../utils/api';
import type { Category } from '../types/Category';

export async function getCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>('categorias');
}