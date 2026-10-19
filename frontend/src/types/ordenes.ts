import { Cliente, Vehiculo, Mecanico } from './catalog';

export type EstadoOrden = 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';

export interface DetalleServicioItem {
  detalleServicioId?: number;
  ordenId?: number;
  servicioId: number;
  precioUnitario: number;
  servicio?: {
    servicioId: number;
    nombre: string;
    costo: number;
  };
}

export interface DetalleRepuestoItem {
  detalleRepuestoId?: number;
  ordenId?: number;
  repuestoId: number;
  cantidad: number;
  precioUnitario: number;
  repuesto?: {
    repuestoId: number;
    nombre: string;
    precio: number;
  };
}

export interface OrdenTrabajo {
  ordenId: number;
  fechaIngreso: string;
  estado: EstadoOrden;
  observaciones?: string | null;
  clienteId: number;
  vehiculoId: number;
  mecanicoId: number;
  cliente?: Cliente;
  vehiculo?: Vehiculo;
  mecanico?: Mecanico;
  detalleServicios?: DetalleServicioItem[];
  detalleRepuestos?: DetalleRepuestoItem[];
}

export interface OrdenTrabajoDTO {
  fechaIngreso: string;
  estado: string;
  observaciones: string;
  clienteId: number;
  vehiculoId: number;
  mecanicoId: number;
}
