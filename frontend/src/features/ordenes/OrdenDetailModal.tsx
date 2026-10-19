import React from 'react';
import { Modal } from '../../components/common/Modal';
import { OrdenTrabajo, EstadoOrden } from '../../types/ordenes';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle2, AlertCircle, XCircle, User, Car, Wrench, Calendar, Edit, Trash2 } from 'lucide-react';

interface OrdenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: OrdenTrabajo | null;
  onEdit: (orden: OrdenTrabajo) => void;
  onDelete: (ordenId: number) => void;
}

export const OrdenDetailModal: React.FC<OrdenDetailModalProps> = ({
  isOpen,
  onClose,
  orden,
  onEdit,
  onDelete,
}) => {
  const { isAdmin } = useAuth();

  if (!orden) return null;

  const getStatusBadge = (estado: EstadoOrden) => {
    const config = {
      Pendiente: { bg: '#fef3c7', text: '#92400e', icon: Clock, label: 'Pendiente' },
      'En Proceso': { bg: '#dbeafe', text: '#1e40af', icon: AlertCircle, label: 'En Proceso' },
      Completada: { bg: '#dcfce7', text: '#166534', icon: CheckCircle2, label: 'Completada' },
      Cancelada: { bg: '#fee2e2', text: '#991b1b', icon: XCircle, label: 'Cancelada' },
    }[estado] || { bg: '#f1f5f9', text: '#475569', icon: Clock, label: estado };

    const Icon = config.icon;

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          backgroundColor: config.bg,
          color: config.text,
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '0.85rem',
        }}
      >
        <Icon aria-hidden="true" style={{ width: 14, height: 14 }} />
        <span>{config.label}</span>
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Orden #${orden.ordenId}`}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Cabecera con Estado y Fecha */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar aria-hidden="true" style={{ width: 18, height: 18, color: '#64748b' }} />
            <span style={{ fontSize: '0.9rem', color: '#475569' }}>
              Fecha Ingreso: <strong>{new Date(orden.fechaIngreso).toLocaleDateString('es-CL')}</strong>
            </span>
          </div>
          <div>{getStatusBadge(orden.estado)}</div>
        </div>

        {/* Información del Cliente */}
        <section
          aria-labelledby="detail-cliente-title"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <h3
            id="detail-cliente-title"
            style={{
              margin: '0 0 0.75rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <User aria-hidden="true" style={{ width: 18, height: 18, color: '#2563eb' }} />
            <span>Datos del Cliente</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Nombre: </span>
              <strong>{orden.cliente ? `${orden.cliente.nombre} ${orden.cliente.apellido}` : `Cliente #${orden.clienteId}`}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Teléfono: </span>
              <strong>{orden.cliente?.telefono || 'No registrado'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Correo: </span>
              <strong>{orden.cliente?.correo || 'No registrado'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Dirección: </span>
              <strong>{orden.cliente?.direccion || 'No registrada'}</strong>
            </div>
          </div>
        </section>

        {/* Información del Vehículo y Mecánico */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <section
            aria-labelledby="detail-vehiculo-title"
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <h3
              id="detail-vehiculo-title"
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Car aria-hidden="true" style={{ width: 18, height: 18, color: '#2563eb' }} />
              <span>Vehículo</span>
            </h3>
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Patente: </span>
                <span
                  style={{
                    backgroundColor: '#f1f5f9',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}
                >
                  {orden.vehiculo?.patente || `ID #${orden.vehiculoId}`}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Color: </span>
                <strong>{orden.vehiculo?.color || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Año: </span>
                <strong>{orden.vehiculo?.anio || 'N/A'}</strong>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="detail-mecanico-title"
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <h3
              id="detail-mecanico-title"
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Wrench aria-hidden="true" style={{ width: 18, height: 18, color: '#2563eb' }} />
              <span>Mecánico Asignado</span>
            </h3>
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Nombre: </span>
                <strong>
                  {orden.mecanico ? `${orden.mecanico.nombre} ${orden.mecanico.apellido}` : `ID #${orden.mecanicoId}`}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Teléfono: </span>
                <strong>{orden.mecanico?.telefono || 'No registrado'}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* Observaciones */}
        <section
          aria-labelledby="detail-obs-title"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: '#ffffff',
          }}
        >
          <h3
            id="detail-obs-title"
            style={{
              margin: '0 0 0.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            Observaciones y Diagnóstico
          </h3>
          <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {orden.observaciones || 'Sin observaciones registradas.'}
          </p>
        </section>

        {/* Botones de Acción */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(orden);
              }}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                minHeight: 44,
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Edit aria-hidden="true" style={{ width: 16, height: 16 }} />
              <span>Editar</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(orden.ordenId);
                }}
                className="btn btn-danger"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  minHeight: 44,
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Trash2 aria-hidden="true" style={{ width: 16, height: 16 }} />
                <span>Eliminar (Admin)</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{
              minHeight: 44,
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

