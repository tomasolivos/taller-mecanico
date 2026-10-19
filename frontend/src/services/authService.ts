import { apiClient } from './apiClient';
import { LoginRequest, LoginResponse, User, DecodedToken, UserRole } from '../types/auth';

const TOKEN_KEY = 'taller_jwt_token';
const USER_KEY = 'taller_user';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/usuarios/login', credentials);
    const data = response.data;

    let user: User;
    if (data.usuario) {
      user = data.usuario;
    } else {
      // Si el backend no devolviera usuario explícito, lo derivamos de los claims del JWT
      const decoded = authService.decodeToken(data.token);
      const nombre = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded?.name || credentials.nombreUsuario;
      const rol = (decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded?.role || 'Mecanico') as UserRole;
      user = {
        usuarioId: 1,
        nombre,
        correo: `${nombre}@taller.local`,
        rol,
      };
    }

    authService.saveSession(data.token, user);
    return { token: data.token, usuario: user };
  },

  logout(): void {
    authService.clearSession();
  },

  saveSession(token: string, user: User): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  decodeToken(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4 !== 0) {
        payload += '=';
      }
      const decodedJson = atob(payload);
      return JSON.parse(decodedJson) as DecodedToken;
    } catch {
      return null;
    }
  },

  isTokenExpired(token: string): boolean {
    const decoded = authService.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    // Expira si la hora actual en segundos supera o iguala a exp
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return nowInSeconds >= decoded.exp;
  },

  isAuthenticated(): boolean {
    const token = authService.getToken();
    if (!token) return false;
    if (authService.isTokenExpired(token)) {
      authService.clearSession();
      return false;
    }
    return true;
  },
};

