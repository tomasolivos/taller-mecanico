import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../features/auth/LoginPage';
import { BrowserRouter } from 'react-router-dom';

const mockLogin = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isMecanico: false,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el título, los campos de formulario y botones accesibles', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /taller mecánico/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('debe mostrar errores de validación en cliente (Zod) si los campos están vacíos', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/el nombre de usuario es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('debe llamar a login con los valores ingresados al enviar el formulario válido', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const userInput = screen.getByLabelText(/nombre de usuario/i);
    const passInput = screen.getByLabelText(/^contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(userInput, { target: { value: 'admin' } });
    fireEvent.change(passInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        nombreUsuario: 'admin',
        password: 'Password123!',
      });
    });
  });

  it('debe permitir autocompletar credenciales de demostración para pruebas rápidas', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const adminBtn = screen.getByRole('button', { name: /rol admin/i });
    fireEvent.click(adminBtn);

    const userInput = screen.getByLabelText(/nombre de usuario/i) as HTMLInputElement;
    const passInput = screen.getByLabelText(/^contraseña/i) as HTMLInputElement;

    expect(userInput.value).toBe('admin');
    expect(passInput.value).toBe('Password123!');
  });
});
