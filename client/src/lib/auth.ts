import { apiRequest } from "./queryClient";
import type { User, LoginRequest } from "@shared/schema";

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export class AuthService {
  private static TOKEN_KEY = 'auth_token';
  
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    const data = await response.json();
    
    this.setToken(data.token);
    return data;
  }
  
  static async logout(): Promise<void> {
    try {
      await apiRequest('POST', '/api/auth/logout');
    } finally {
      this.removeToken();
    }
  }
  
  static async getCurrentUser(): Promise<Omit<User, 'password'> | null> {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        this.removeToken();
        return null;
      }
      
      if (!response.ok) {
        throw new Error('Failed to get current user');
      }
      
      return await response.json();
    } catch (error) {
      this.removeToken();
      return null;
    }
  }
}

// Update the default query client to include auth headers
export function getAuthHeaders(): Record<string, string> {
  const token = AuthService.getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
