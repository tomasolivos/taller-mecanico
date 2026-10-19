import { apiClient } from './apiClient';
import { Cliente, ClienteDTO, Vehiculo, Mecanico, Servicio, Repuesto } from '../types/catalog';

export const catalogService = {
  async getClientes(): Promise<Cliente[]> {
    const response = await apiClient.get<Cliente[]>('/clientes');
    return response.data;
  },

  async createCliente(dto: ClienteDTO): Promise<Cliente> {
    const response = await apiClient.post<Cliente>('/clientes', dto);
    return response.data;
  },

  async getVehiculos(): Promise<Vehiculo[]> {
    const response = await apiClient.get<Vehiculo[]>('/vehiculos');
    return response.data;
  },

  async getMecanicos(): Promise<Mecanico[]> {
    const response = await apiClient.get<Mecanico[]>('/mecanicos');
    return response.data;
  },

  async getServicios(): Promise<Servicio[]> {
    const response = await apiClient.get<Servicio[]>('/servicios');
    return response.data;
  },

  async getRepuestos(): Promise<Repuesto[]> {
    const response = await apiClient.get<Repuesto[]>('/repuestos');
    return response.data;
  },
};

