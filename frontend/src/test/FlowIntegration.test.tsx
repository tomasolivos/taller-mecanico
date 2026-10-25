import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '../features/auth/LoginPage';
import { OrdenesListPage } from '../features/ordenes/OrdenesListPage';
import { ordenesService } from '../services/ordenesService';
import { catalogService } from '../services/catalogService';
import * as AuthContext from '../context/AuthContext';
import { OrdenTrabajo } from '../types/ordenes';

const mockOrdenes: OrdenTrabajo[] = [
  {
    ordenId: 201,
    fechaIngreso: '2026-10-25T10:00:00Z',
    estado: 'En Proceso',
    observaciones: 'Alineación y balanceo computarizado',
    clienteId: 1,
    vehiculoId: 1,
    mecanicoId: 1,
    cliente: {
      clienteId: 1,
      nombre: 'Roberto',
      apellido: 'Gómez',
      telefono: '99887766',
      correo: 'roberto@taller.local',
      direccion: 'Av. Libertador 456',
    },
    vehiculo: {
      vehiculoId: 1,
      patente: 'AB123CD',
      color: 'Azul',
      anio: 2022,
      clienteId: 1,
      modeloId: 1,
    },
    mecanico: {
      mecanicoId: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      especialidadId: 1,
    },
  },
];

describe('E2E Full Flow Integration Test: Login -> Listar Recurso -> Crear / Gestionar Orden', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
    vi.clearAllMocks();
    vi.spyOn(ordenesService, 'getOrdenes').mockResolvedValue(mockOrdenes);
    vi.spyOn(catalogService, 'getClientes').mockResolvedValue([]);
    vi.spyOn(catalogService, 'getVehiculos').mockResolvedValue([]);
    vi.spyOn(catalogService, 'getMecanicos').mockResolvedValue([]);
  });

  it('debe autenticar credenciales válidas y llamar al servicio de login', async () => {
    const mockLoginFn = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isMecanico: false,
      isLoading: false,
      login: mockLoginFn,
      logout: vi.fn(),
    });

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
      expect(mockLoginFn).toHaveBeenCalledWith({
        nombreUsuario: 'admin',
        password: 'Password123!',
      });
    });
  });

  it('debe completar el flujo integral de negocio: listar orden en tabla y consultar detalle', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { usuarioId: 1, nombre: 'admin', correo: 'admin@taller.local', rol: 'Admin' },
      token: 'jwt-token-admin',
      isAuthenticated: true,
      isAdmin: true,
      isMecanico: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OrdenesListPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Esperar a que los datos de la orden aparezcan en pantalla
    await waitFor(() => {
      expect(screen.getAllByText(/Roberto Gómez/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText('AB123CD')[0]).toBeInTheDocument();
    });

    // Abrir modal de detalle
    const viewButtons = screen.getAllByLabelText(/ver detalle de orden #201/i);
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Detalle de Orden #201/i)).toBeInTheDocument();
      expect(screen.getByText(/Alineación y balanceo computarizado/i)).toBeInTheDocument();
    });
  });
});

