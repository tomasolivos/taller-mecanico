import { apiClient } from './apiClient';
import { OrdenTrabajo, OrdenTrabajoDTO } from '../types/ordenes';

export const ordenesService = {
  async getOrdenes(): Promise<OrdenTrabajo[]> {
    const response = await apiClient.get<OrdenTrabajo[]>('/ordenes-trabajo');
    return response.data;
  },

  async getOrdenById(id: number): Promise<OrdenTrabajo> {
    const response = await apiClient.get<OrdenTrabajo>(`/ordenes-trabajo/${id}`);
    return response.data;
  },

  async createOrden(dto: OrdenTrabajoDTO): Promise<OrdenTrabajo> {
    const response = await apiClient.post<OrdenTrabajo>('/ordenes-trabajo', dto);
    return response.data;
  },

  async updateOrden(id: number, dto: OrdenTrabajoDTO): Promise<void> {
    await apiClient.put(`/ordenes-trabajo/${id}`, dto);
  },

  async deleteOrden(id: number): Promise<void> {
    await apiClient.delete(`/ordenes-trabajo/${id}`);
  },
};

