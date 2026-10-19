import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { OrdenTrabajo, OrdenTrabajoDTO } from '../../types/ordenes';
import { Cliente, Vehiculo, Mecanico } from '../../types/catalog';
import { catalogService } from '../../services/catalogService';
import { ApiErrorDetail } from '../../types/api';

const ordenSchema = z.object({
  clienteId: z.coerce.number().min(1, 'Debe seleccionar un cliente.'),
  vehiculoId: z.coerce.number().min(1, 'Debe seleccionar un vehículo.'),
  mecanicoId: z.coerce.number().min(1, 'Debe seleccionar un mecánico asignado.'),
  fechaIngreso: z.string().min(1, 'La fecha de ingreso es obligatoria.'),
  estado: z.enum(['Pendiente', 'En Proceso', 'Completada', 'Cancelada'] as const, {
    errorMap: () => ({ message: 'Seleccione un estado válido.' }),
  }),
  observaciones: z
    .string()
    .min(3, 'Las observaciones deben tener al menos 3 caracteres.')
    .max(500, 'Las observaciones no pueden exceder 500 caracteres.'),
});

type OrdenFormData = z.infer<typeof ordenSchema>;

interface OrdenFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: OrdenTrabajoDTO) => Promise<void>;
  initialData?: OrdenTrabajo | null;
}

export const OrdenFormModal: React.FC<OrdenFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = !!initialData;
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState<boolean>(true);
  const [apiError, setApiError] = useState<ApiErrorDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<OrdenFormData>({
    resolver: zodResolver(ordenSchema),
    defaultValues: {
      clienteId: 0,
      vehiculoId: 0,
      mecanicoId: 0,
      fechaIngreso: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      observaciones: '',
    },
  });

  const selectedClienteId = watch('clienteId');

  // Carga de catálogos relacionados (Clientes, Vehículos, Mecánicos)
  useEffect(() => {
    if (isOpen) {
      setIsLoadingCatalogs(true);
      setApiError(null);
      Promise.all([
        catalogService.getClientes(),
        catalogService.getVehiculos(),
        catalogService.getMecanicos(),
      ])
        .then(([cls, vechs, mecs]) => {
          setClientes(cls);
          setVehiculos(vechs);
          setMecanicos(mecs);
        })
        .catch((err) => {
          setApiError(err as ApiErrorDetail);
        })
        .finally(() => {
          setIsLoadingCatalogs(false);
        });
    }
  }, [isOpen]);

  // Poblado de formulario cuando se edita
  useEffect(() => {
    if (initialData) {
      reset({
        clienteId: initialData.clienteId,
        vehiculoId: initialData.vehiculoId,
        mecanicoId: initialData.mecanicoId,
        fechaIngreso: initialData.fechaIngreso
          ? initialData.fechaIngreso.split('T')[0]
          : new Date().toISOString().split('T')[0],
        estado: initialData.estado,
        observaciones: initialData.observaciones || '',
      });
    } else {
      reset({
        clienteId: 0,
        vehiculoId: 0,
        mecanicoId: 0,
        fechaIngreso: new Date().toISOString().split('T')[0],
        estado: 'Pendiente',
        observaciones: '',
      });
    }
  }, [initialData, reset, isOpen]);

  // Filtrar vehículos del cliente seleccionado si existe relación
  const vehiculosFiltrados = Number(selectedClienteId) > 0
    ? vehiculos.filter((v) => v.clienteId === Number(selectedClienteId))
    : vehiculos;

  const handleFormSubmit = async (formData: OrdenFormData) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const dto: OrdenTrabajoDTO = {
        clienteId: Number(formData.clienteId),
        vehiculoId: Number(formData.vehiculoId),
        mecanicoId: Number(formData.mecanicoId),
        fechaIngreso: formData.fechaIngreso,
        estado: formData.estado,
        observaciones: formData.observaciones,
      };
      await onSubmit(dto);
      onClose();
    } catch (err) {
      setApiError(err as ApiErrorDetail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Orden #${initialData?.ordenId}` : 'Crear Nueva Orden de Trabajo'}
      size="md"
    >
      {apiError && (
        <Alert
          type="error"
          title="Error en el procesamiento"
          message={apiError.message}
          errorsList={apiError.errors ? Object.values(apiError.errors).flat() : undefined}
          onClose={() => setApiError(null)}
        />
      )}

      {isLoadingCatalogs ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
          Cargando listas de clientes, vehículos y mecánicos...
        </p>
      ) : (
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {/* Selección de Cliente */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="clienteId" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
              Cliente <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="clienteId"
              {...register('clienteId')}
              aria-required="true"
              aria-invalid={errors.clienteId ? 'true' : 'false'}
              aria-describedby={errors.clienteId ? 'clienteId-error' : undefined}
              style={{
                minHeight: 44,
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                border: `1px solid ${errors.clienteId ? '#ef4444' : '#cbd5e1'}`,
                backgroundColor: '#ffffff',
                fontSize: '1rem',
                color: '#0f172a',
              }}
            >
              <option value="0">-- Seleccione un cliente --</option>
              {clientes.map((c) => (
                <option key={c.clienteId} value={c.clienteId}>
                  {c.nombre} {c.apellido} ({c.correo || c.telefono || 'Sin contacto'})
                </option>
              ))}
            </select>
            {errors.clienteId && (
              <span id="clienteId-error" role="alert" aria-live="polite" style={{ color: '#dc2626', fontSize: '0.825rem' }}>
                {errors.clienteId.message}
              </span>
            )}
          </div>

          {/* Selección de Vehículo */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="vehiculoId" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
              Vehículo <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="vehiculoId"
              {...register('vehiculoId')}
              aria-required="true"
              aria-invalid={errors.vehiculoId ? 'true' : 'false'}
              aria-describedby={errors.vehiculoId ? 'vehiculoId-error' : undefined}
              style={{
                minHeight: 44,
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                border: `1px solid ${errors.vehiculoId ? '#ef4444' : '#cbd5e1'}`,
                backgroundColor: '#ffffff',
                fontSize: '1rem',
                color: '#0f172a',
              }}
            >
              <option value="0">-- Seleccione un vehículo --</option>
              {vehiculosFiltrados.map((v) => (
                <option key={v.vehiculoId} value={v.vehiculoId}>
                  Patente: {v.patente} {v.color ? `(${v.color})` : ''} {v.anio ? `- Año ${v.anio}` : ''}
                </option>
              ))}
            </select>
            {errors.vehiculoId && (
              <span id="vehiculoId-error" role="alert" aria-live="polite" style={{ color: '#dc2626', fontSize: '0.825rem' }}>
                {errors.vehiculoId.message}
              </span>
            )}
          </div>

          {/* Selección de Mecánico Asignado */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="mecanicoId" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
              Mecánico Asignado <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="mecanicoId"
              {...register('mecanicoId')}
              aria-required="true"
              aria-invalid={errors.mecanicoId ? 'true' : 'false'}
              aria-describedby={errors.mecanicoId ? 'mecanicoId-error' : undefined}
              style={{
                minHeight: 44,
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                border: `1px solid ${errors.mecanicoId ? '#ef4444' : '#cbd5e1'}`,
                backgroundColor: '#ffffff',
                fontSize: '1rem',
                color: '#0f172a',
              }}
            >
              <option value="0">-- Seleccione un mecánico --</option>
              {mecanicos.map((m) => (
                <option key={m.mecanicoId} value={m.mecanicoId}>
                  {m.nombre} {m.apellido} {m.telefono ? `(${m.telefono})` : ''}
                </option>
              ))}
            </select>
            {errors.mecanicoId && (
              <span id="mecanicoId-error" role="alert" aria-live="polite" style={{ color: '#dc2626', fontSize: '0.825rem' }}>
                {errors.mecanicoId.message}
              </span>
            )}
          </div>

          {/* Fecha y Estado en dos columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="fechaIngreso" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                Fecha de Ingreso <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="fechaIngreso"
                type="date"
                {...register('fechaIngreso')}
                aria-required="true"
                aria-invalid={errors.fechaIngreso ? 'true' : 'false'}
                aria-describedby={errors.fechaIngreso ? 'fechaIngreso-error' : undefined}
                style={{
                  minHeight: 44,
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  border: `1px solid ${errors.fechaIngreso ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '1rem',
                  color: '#0f172a',
                }}
              />
              {errors.fechaIngreso && (
                <span id="fechaIngreso-error" role="alert" aria-live="polite" style={{ color: '#dc2626', fontSize: '0.825rem' }}>
                  {errors.fechaIngreso.message}
                </span>
              )}
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="estado" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                Estado <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                id="estado"
                {...register('estado')}
                aria-required="true"
                aria-invalid={errors.estado ? 'true' : 'false'}
                aria-describedby={errors.estado ? 'estado-error' : undefined}
                style={{
                  minHeight: 44,
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  border: `1px solid ${errors.estado ? '#ef4444' : '#cbd5e1'}`,
                  backgroundColor: '#ffffff',
                  fontSize: '1rem',
                  color: '#0f172a',
                }}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
              {errors.estado && (
                <span id="estado-error" role="alert" aria-live="polite" style={{ color: '#dc2626', fontSize: '0.825rem' }}>
                  {errors.estado.message}
                </span>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="observaciones" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
              Observaciones y Diagnóstico <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              id="observaciones"
              rows={3}
              {...register('observaciones')}
              aria-required="true"
              aria-invalid={errors.observaciones ? 'true' : 'false'}
              aria-describedby={errors.observaciones ? 'observaciones-error' : undefined}
              placeholder="Describa el trabajo a realizar o falla reportada por el cliente..."
              style={{
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                border: `1px solid ${errors.observaciones ? '#ef4444' : '#cbd5e1'}`,
                fontSize: '1rem',
                fontFamily: 'inherit',
                color: '#0f172a',
                resize: 'vertical',
              }}
            />
            {errors.observaciones && (
              <span id="observaciones-error" role="alert" aria-live="polite" style={{ color: '#dc2626', fontSize: '0.825rem' }}>
                {errors.observaciones.message}
              </span>
            )}
          </div>

          {/* Botones de Acción */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
              style={{
                minWidth: 100,
                minHeight: 44,
                padding: '0.625rem 1rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                minWidth: 130,
                minHeight: 44,
                padding: '0.625rem 1.25rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Orden'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
