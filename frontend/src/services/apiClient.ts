import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorDetail } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de Solicitud: Adjunta el JWT Bearer si existe en sessionStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('taller_jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Normaliza errores y gestiona 401, 403, 429
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]>; title?: string }>) => {
    const status = error.response?.status || 500;
    const data = error.response?.data;

    let message = 'Ocurrió un error inesperado en la comunicación con el servidor.';
    let validationErrors: Record<string, string[]> | undefined = undefined;

    if (status === 401) {
      message = 'Sesión expirada o credenciales inválidas. Por favor inicie sesión nuevamente.';
      // Limpia sesión y notifica al contexto
      sessionStorage.removeItem('taller_jwt_token');
      sessionStorage.removeItem('taller_user');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    } else if (status === 403) {
      message = 'Acceso denegado: No posee los permisos o el rol requerido para realizar esta acción.';
    } else if (status === 429) {
      message = 'Límite de solicitudes alcanzado (Rate Limit). Espere un minuto antes de intentar nuevamente.';
    } else if (status === 400 || status === 422) {
      message = data?.message || data?.title || 'Los datos enviados no son válidos.';
      if (data?.errors) {
        validationErrors = data.errors;
      }
    } else if (status === 404) {
      message = 'El recurso solicitado no fue encontrado.';
    } else if (status >= 500) {
      message = data?.message || 'Error interno del servidor. Por favor intente más tarde.';
    }

    const normalizedError: ApiErrorDetail = {
      statusCode: status,
      message,
      errors: validationErrors,
    };

    return Promise.reject(normalizedError);
  }
);

