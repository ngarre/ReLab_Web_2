import { fetchAPI } from '../utils/api';
import type { User } from '../types/User';
import type { UserUpdate } from '../types/UserUpdate';

export async function getUsers(token: string): Promise<User[]> {
  return fetchAPI<User[]>('usuarios', {
    token,
  });
}

export async function updateUser(
  userId: number,
  data: UserUpdate,
  token: string
): Promise<User> {
  return fetchAPI<User>(`usuarios/${userId}`, {
    method: 'PUT',
    body: data,
    token,
  });
}

export async function deleteUserAccount(userId: number, token: string): Promise<void> {
  return fetchAPI<void>(`usuarios/${userId}/cuenta`, {
    method: 'DELETE',
    token,
  });
}