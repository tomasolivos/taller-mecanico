import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrdenesListPage } from '../features/ordenes/OrdenesListPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ordenesService } from '../services/ordenesService';
import { catalogService } from '../services/catalogService';
import * as AuthContext from '../context/AuthContext';
import { OrdenTrabajo } from '../types/ordenes';

const mockOrdenes: OrdenTrabajo[] = [
  {
    ordenId: 101,
    fechaIngreso: '2026-10-18T10:00:00Z',
    estado: 'En Proceso',
    observaciones: 'Cambio de pastillas delanteras',
    clienteId: 1,
    vehiculoId: 1,
    mecanicoId: 1,
    cliente: {
      clienteId: 1,
      nombre: 'Carlos',
      apellido: 'Soto',
      telefono: '555-1234',
      correo: 'carlos@email.com',
      direccion: 'Calle Falsa 123',
    },
    vehiculo: {
      vehiculoId: 1,
      patente: 'JJ8899',
      color: 'Gris',
      anio: 2021,
      clienteId: 1,
      modeloId: 1,
    },
    mecanico: {
      mecanicoId: 1,
      nombre: 'Pedro',
      apellido: 'Martínez',
      especialidadId: 1,
    },
  },
];

describe('OrdenesListPage CRUD and Role Authorization', () => {
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

  it('debe listar las órdenes de trabajo recibidas desde la API con su estado y datos asociados', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { usuarioId: 1, nombre: 'admin', correo: 'admin@taller.local', rol: 'Admin' },
      token: 'jwt-admin',
      isAuthenticated: true,
      isAdmin: true,
      isMecanico: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OrdenesListPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/cargando listado de órdenes/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/#101/).length).toBeGreaterThan(0);
      expect(screen.getAllByText('Carlos Soto').length).toBeGreaterThan(0);
      expect(screen.getAllByText('JJ8899').length).toBeGreaterThan(0);
      expect(screen.getAllByText('En Proceso').length).toBeGreaterThan(0);
    });
  });

  it('el rol Administrador debe tener visible y habilitado el botón de eliminar', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { usuarioId: 1, nombre: 'admin', correo: 'admin@taller.local', rol: 'Admin' },
      token: 'jwt-admin',
      isAuthenticated: true,
      isAdmin: true,
      isMecanico: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OrdenesListPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText(/eliminar orden #101/i);
      expect(deleteButtons[0]).toBeInTheDocument();
      expect(deleteButtons[0]).not.toBeDisabled();
    });
  });

  it('el rol Mecánico puede intentar eliminar y la API rechaza la solicitud con 403', async () => {
    vi.spyOn(ordenesService, 'deleteOrden').mockRejectedValue({
      statusCode: 403,
      message: 'Acceso denegado',
    });

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { usuarioId: 2, nombre: 'mecanico', correo: 'mecanico@taller.local', rol: 'Mecanico' },
      token: 'jwt-mec',
      isAuthenticated: true,
      isAdmin: false,
      isMecanico: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OrdenesListPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const deleteButton = screen.getAllByLabelText('Eliminar orden #101')[0];
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toBeEnabled();
    });

    fireEvent.click(screen.getAllByLabelText('Eliminar orden #101')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Orden' }));

    await waitFor(() => {
      expect(ordenesService.deleteOrden).toHaveBeenCalledWith(101);
      expect(screen.getByRole('alert')).toHaveTextContent(/403.*solo el rol administrador/i);
    });
  });

  it('debe filtrar reactivamente el listado al escribir en la barra de búsqueda', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { usuarioId: 1, nombre: 'admin', correo: 'admin@taller.local', rol: 'Admin' },
      token: 'jwt-admin',
      isAuthenticated: true,
      isAdmin: true,
      isMecanico: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OrdenesListPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('JJ8899').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByLabelText(/buscar por cliente, patente o falla/i);
    fireEvent.change(searchInput, { target: { value: 'Inexistente' } });

    await waitFor(() => {
      expect(screen.queryByText('JJ8899')).not.toBeInTheDocument();
      expect(screen.getByText(/no se encontraron órdenes de trabajo/i)).toBeInTheDocument();
    });
  });

  it('debe abrir el modal de creación de orden al presionar "Nueva Orden"', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { usuarioId: 1, nombre: 'admin', correo: 'admin@taller.local', rol: 'Admin' },
      token: 'jwt-admin',
      isAuthenticated: true,
      isAdmin: true,
      isMecanico: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OrdenesListPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/#101/).length).toBeGreaterThan(0);
    });

    const createBtn = screen.getByRole('button', { name: /nueva orden/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /crear nueva orden de trabajo/i })).toBeInTheDocument();
    });
  });
});
