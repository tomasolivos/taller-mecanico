import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import * as AuthContext from '../context/AuthContext';

describe('ProtectedRoute Guard', () => {
  it('debe redirigir al login si el usuario no está autenticado', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isMecanico: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/privado']}>
        <Routes>
          <Route path="/login" element={<div>Vista de Login</div>} />
          <Route
            path="/privado"
            element={
              <ProtectedRoute>
                <div>Contenido Privado</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Vista de Login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Privado')).not.toBeInTheDocument();
  });

  it('debe redirigir a acceso denegado (403) si el usuario no tiene el rol permitido', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { usuarioId: 2, nombre: 'mecanico', correo: 'mecanico@taller.local', rol: 'Mecanico' },
      token: 'valid-token',
      isAuthenticated: true,
      isAdmin: false,
      isMecanico: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin-only']}>
        <Routes>
          <Route path="/acceso-denegado" element={<div>Vista Acceso Denegado 403</div>} />
          <Route
            path="/admin-only"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <div>Panel Solo Administrador</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Vista Acceso Denegado 403')).toBeInTheDocument();
    expect(screen.queryByText('Panel Solo Administrador')).not.toBeInTheDocument();
  });

  it('debe renderizar el contenido protegido cuando el usuario cumple con la autenticación y el rol', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { usuarioId: 1, nombre: 'admin', correo: 'admin@taller.local', rol: 'Admin' },
      token: 'valid-token',
      isAuthenticated: true,
      isAdmin: true,
      isMecanico: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin-only']}>
        <Routes>
          <Route
            path="/admin-only"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <div>Panel Solo Administrador</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Panel Solo Administrador')).toBeInTheDocument();
  });
});
