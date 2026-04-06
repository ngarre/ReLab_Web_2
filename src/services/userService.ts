import { fetchAPI } from '../utils/api';
import type { User } from '../types/User';

export async function getUsers(token: string): Promise<User[]> {
  return fetchAPI<User[]>('usuarios', {
    token,
  });
}