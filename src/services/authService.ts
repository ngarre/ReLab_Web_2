import { fetchAPI } from '../utils/api';
import type { User } from '../types/User';
import type { AuthResponse, LoginRequest } from '../types/Auth';

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>('auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export async function getMyProfile(token: string): Promise<User> {
  return fetchAPI<User>('usuarios/me', {
    token,
  });
}