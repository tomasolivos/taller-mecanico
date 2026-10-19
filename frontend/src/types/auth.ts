export type UserRole = 'Admin' | 'Mecanico';

export interface User {
  usuarioId: number;
  nombre: string;
  correo: string;
  rol: UserRole;
}

export interface LoginRequest {
  nombreUsuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

export interface DecodedToken {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  name?: string;
  role?: string;
  exp?: number;
  iss?: string;
  aud?: string;
}

