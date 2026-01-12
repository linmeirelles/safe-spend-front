import { api } from '@/lib/api';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify({
      userId: response.userId,
      name: response.name,
      email: response.email,
    }));
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify({
      userId: response.userId,
      name: response.name,
      email: response.email,
    }));
    return response;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
