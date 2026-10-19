export interface Cliente {
  clienteId: number;
  nombre: string;
  apellido: string;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
}

export interface ClienteDTO {
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
}

export interface Marca {
  marcaId: number;
  nombre: string;
}

export interface Modelo {
  modeloId: number;
  nombre: string;
  marcaId: number;
  marca?: Marca;
}

export interface Vehiculo {
  vehiculoId: number;
  patente: string;
  color?: string | null;
  anio?: number | null;
  clienteId: number;
  modeloId: number;
  cliente?: Cliente;
  modelo?: Modelo;
}

export interface Especialidad {
  especialidadId: number;
  nombre: string;
  descripcion?: string | null;
}

export interface Mecanico {
  mecanicoId: number;
  nombre: string;
  apellido: string;
  telefono?: string | null;
  especialidadId: number;
  especialidad?: Especialidad;
}

export interface Servicio {
  servicioId: number;
  nombre: string;
  descripcion?: string | null;
  costo: number;
}

export interface Repuesto {
  repuestoId: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
}

