import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordenesService } from '../../services/ordenesService';
import { OrdenTrabajo, OrdenTrabajoDTO, EstadoOrden } from '../../types/ordenes';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { OrdenFormModal } from './OrdenFormModal';
import { OrdenDetailModal } from './OrdenDetailModal';
import { ApiErrorDetail } from '../../types/api';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Car,
  User,
} from 'lucide-react';

export const OrdenesListPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Estados de interfaz y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Estados para modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrden, setEditingOrden] = useState<OrdenTrabajo | null>(null);
  const [viewingOrden, setViewingOrden] = useState<OrdenTrabajo | null>(null);
  const [deletingOrdenId, setDeletingOrdenId] = useState<number | null>(null);

  // Notificaciones y alertas
  const [feedbackAlert, setFeedbackAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  // Query: Listar órdenes de trabajo
  const {
    data: ordenes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<OrdenTrabajo[], ApiErrorDetail>({
    queryKey: ['ordenes'],
    queryFn: ordenesService.getOrdenes,
  });

  // Mutación: Crear orden
  const createMutation = useMutation({
    mutationFn: (dto: OrdenTrabajoDTO) => ordenesService.createOrden(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      setFeedbackAlert({
        type: 'success',
        title: 'Orden Creada',
        message: 'La orden de trabajo fue registrada exitosamente.',
      });
    },
    onError: (err: ApiErrorDetail) => {
      setFeedbackAlert({
        type: 'error',
        title: 'Error al Crear',
        message: err.message,
      });
    },
  });

  // Mutación: Actualizar orden
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: OrdenTrabajoDTO }) =>
      ordenesService.updateOrden(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      setFeedbackAlert({
        type: 'success',
        title: 'Orden Actualizada',
        message: 'Los datos de la orden de trabajo fueron modificados correctamente.',
      });
    },
    onError: (err: ApiErrorDetail) => {
      setFeedbackAlert({
        type: 'error',
        title: 'Error al Actualizar',
        message: err.message,
      });
    },
  });

  // Mutación: Eliminar orden (Solo Admin en Backend)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => ordenesService.deleteOrden(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      setDeletingOrdenId(null);
      setFeedbackAlert({
        type: 'success',
        title: 'Orden Eliminada',
        message: 'La orden de trabajo ha sido eliminada del sistema.',
      });
    },
    onError: (err: ApiErrorDetail) => {
      setDeletingOrdenId(null);
      setFeedbackAlert({
        type: 'error',
        title: 'Acción Denegada (OWASP)',
        message:
          err.statusCode === 403
            ? 'Acceso denegado (403): Solo el rol Administrador tiene autorización para eliminar órdenes.'
            : err.message,
      });
    },
  });

  // Filtrado reactivo en cliente (búsqueda y estado)
  const filteredOrdenes = useMemo(() => {
    return ordenes.filter((o) => {
      const matchesStatus =
        statusFilter === 'Todos' || o.estado.toLowerCase() === statusFilter.toLowerCase();

      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesStatus;

      const clienteNombre = o.cliente
        ? `${o.cliente.nombre} ${o.cliente.apellido}`.toLowerCase()
        : '';
      const patente = o.vehiculo?.patente?.toLowerCase() || '';
      const obs = o.observaciones?.toLowerCase() || '';
      const idMatch = o.ordenId.toString().includes(term);

      const matchesSearch =
        idMatch ||
        clienteNombre.includes(term) ||
        patente.includes(term) ||
        obs.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [ordenes, searchTerm, statusFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredOrdenes.length / pageSize) || 1;
  const paginatedOrdenes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrdenes.slice(start, start + pageSize);
  }, [filteredOrdenes, currentPage, pageSize]);

  // Manejadores
  const handleOpenCreate = () => {
    setEditingOrden(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (orden: OrdenTrabajo) => {
    setEditingOrden(orden);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (dto: OrdenTrabajoDTO) => {
    if (editingOrden) {
      await updateMutation.mutateAsync({ id: editingOrden.ordenId, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingOrdenId !== null) {
      deleteMutation.mutate(deletingOrdenId);
    }
  };

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
          padding: '0.2rem 0.5rem',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '0.8rem',
        }}
      >
        <Icon aria-hidden="true" style={{ width: 14, height: 14 }} />
        <span>{config.label}</span>
      </span>
    );
  };

  return (
    <main id="main-content" role="main" className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Alerta de Feedback */}
      {feedbackAlert && (
        <Alert
          type={feedbackAlert.type}
          title={feedbackAlert.title}
          message={feedbackAlert.message}
          onClose={() => setFeedbackAlert(null)}
        />
      )}

      {/* Cabecera Principal */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Órdenes de Trabajo
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Gestión integral de reparaciones, servicios mecánicos y vehículos en taller
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            minHeight: 44,
            padding: '0.625rem 1.25rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus aria-hidden="true" style={{ width: 20, height: 20 }} />
          <span>Nueva Orden</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <section
        aria-label="Filtros de búsqueda"
        className="filters-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Campo Búsqueda */}
        <div style={{ flex: '1 1 300px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '12px',
              width: 18,
              height: 18,
              color: '#94a3b8',
              pointerEvents: 'none',
            }}
          />
          <input
            id="search-input"
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por cliente, patente o falla..."
            aria-label="Buscar por cliente, patente o falla"
            style={{
              width: '100%',
              minHeight: 44,
              padding: '0.625rem 0.75rem 0.625rem 2.5rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              color: '#0f172a',
            }}
          />
        </div>

        {/* Filtro por Estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter aria-hidden="true" style={{ width: 18, height: 18, color: '#64748b' }} />
          <label htmlFor="status-filter" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
            Estado:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filtrar por estado de la orden"
            style={{
              minHeight: 44,
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.95rem',
              color: '#0f172a',
            }}
          >
            <option value="Todos">Todos ({ordenes.length})</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </section>

      {/* Estados: Carga, Error o Datos */}
      {isLoading ? (
        <LoadingSpinner message="Cargando listado de órdenes desde la API..." />
      ) : isError ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Alert
            type="error"
            title="Error de Conexión"
            message={error?.message || 'No fue posible obtener las órdenes de trabajo.'}
          />
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-secondary"
            style={{
              minHeight: 44,
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reintentar carga
          </button>
        </div>
      ) : filteredOrdenes.length === 0 ? (
        <EmptyState
          title="No se encontraron órdenes de trabajo"
          description={
            searchTerm || statusFilter !== 'Todos'
              ? 'No hay registros que coincidan con los filtros aplicados. Intente limpiando los criterios de búsqueda.'
              : 'Aún no se han registrado órdenes en el sistema.'
          }
          actionText={searchTerm || statusFilter !== 'Todos' ? 'Limpiar Filtros' : 'Crear Primera Orden'}
          onAction={() => {
            if (searchTerm || statusFilter !== 'Todos') {
              setSearchTerm('');
              setStatusFilter('Todos');
            } else {
              handleOpenCreate();
            }
          }}
        />
      ) : (
        <>
          {/* Vista Tabla para Pantallas Medianas y Grandes (>= 768px) */}
          <div className="table-responsive-wrapper" style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <table
              className="ordenes-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.925rem',
              }}
            >
              <caption className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
                Listado de órdenes de trabajo mecánicas registradas
              </caption>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th scope="col" style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#334155' }}>
                    # ID
                  </th>
                  <th scope="col" style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#334155' }}>
                    Cliente
                  </th>
                  <th scope="col" style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#334155' }}>
                    Vehículo
                  </th>
                  <th scope="col" style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#334155' }}>
                    Mecánico
                  </th>
                  <th scope="col" style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#334155' }}>
                    Fecha
                  </th>
                  <th scope="col" style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#334155' }}>
                    Estado
                  </th>
                  <th scope="col" style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#334155', textAlign: 'right' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrdenes.map((orden) => (
                  <tr
                    key={orden.ordenId}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease',
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      #{orden.ordenId}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User aria-hidden="true" style={{ width: 16, height: 16, color: '#64748b' }} />
                        <span>{orden.cliente ? `${orden.cliente.nombre} ${orden.cliente.apellido}` : `Cliente #${orden.clienteId}`}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Car aria-hidden="true" style={{ width: 16, height: 16, color: '#64748b' }} />
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            backgroundColor: '#f1f5f9',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                          }}
                        >
                          {orden.vehiculo?.patente || `Vehículo #${orden.vehiculoId}`}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>
                      {orden.mecanico ? `${orden.mecanico.nombre} ${orden.mecanico.apellido}` : `Mecánico #${orden.mecanicoId}`}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>
                      {new Date(orden.fechaIngreso).toLocaleDateString('es-CL')}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {getStatusBadge(orden.estado)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                        {/* Botón Ver Detalle */}
                        <button
                          type="button"
                          onClick={() => setViewingOrden(orden)}
                          aria-label={`Ver detalle de orden #${orden.ordenId}`}
                          className="btn-action-icon"
                          style={{
                            minWidth: 44,
                            minHeight: 44,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#2563eb',
                          }}
                        >
                          <Eye aria-hidden="true" style={{ width: 18, height: 18 }} />
                        </button>

                        {/* Botón Editar */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(orden)}
                          aria-label={`Editar orden #${orden.ordenId}`}
                          className="btn-action-icon"
                          style={{
                            minWidth: 44,
                            minHeight: 44,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#0284c7',
                          }}
                        >
                          <Edit aria-hidden="true" style={{ width: 18, height: 18 }} />
                        </button>

                        {/* Botón Eliminar - Condicionado por rol (OWASP API5:2023) */}
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => setDeletingOrdenId(orden.ordenId)}
                            aria-label={`Eliminar orden #${orden.ordenId}`}
                            className="btn-action-icon btn-action-danger"
                            style={{
                              minWidth: 44,
                              minHeight: 44,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#dc2626',
                            }}
                          >
                            <Trash2 aria-hidden="true" style={{ width: 18, height: 18 }} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            aria-label={`Eliminar orden #${orden.ordenId} bloqueado para rol ${user?.rol}`}
                            title="Solo el rol Administrador puede eliminar órdenes (OWASP Control de Acceso)"
                            style={{
                              minWidth: 44,
                              minHeight: 44,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              cursor: 'not-allowed',
                              color: '#94a3b8',
                              opacity: 0.6,
                            }}
                          >
                            <Trash2 aria-hidden="true" style={{ width: 18, height: 18 }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista Tarjetas para Pantallas Móviles (< 768px) */}
          <div className="mobile-cards-container" style={{ display: 'none', flexDirection: 'column', gap: '1rem' }}>
            {paginatedOrdenes.map((orden) => (
              <article
                key={orden.ordenId}
                className="orden-mobile-card"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                    Orden #{orden.ordenId}
                  </span>
                  {getStatusBadge(orden.estado)}
                </div>

                <div style={{ fontSize: '0.9rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Cliente: </span>
                    <strong>{orden.cliente ? `${orden.cliente.nombre} ${orden.cliente.apellido}` : `ID #${orden.clienteId}`}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Vehículo: </span>
                    <strong style={{ fontFamily: 'monospace' }}>{orden.vehiculo?.patente || `ID #${orden.vehiculoId}`}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Mecánico: </span>
                    <span>{orden.mecanico ? `${orden.mecanico.nombre} ${orden.mecanico.apellido}` : `ID #${orden.mecanicoId}`}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Fecha: </span>
                    <span>{new Date(orden.fechaIngreso).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewingOrden(orden)}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      minHeight: 44,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    <Eye aria-hidden="true" style={{ width: 16, height: 16 }} />
                    <span>Ver</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(orden)}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      minHeight: 44,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    <Edit aria-hidden="true" style={{ width: 16, height: 16 }} />
                    <span>Editar</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setDeletingOrdenId(orden.ordenId)}
                      className="btn btn-danger"
                      style={{
                        flex: 1,
                        minHeight: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      <Trash2 aria-hidden="true" style={{ width: 16, height: 16 }} />
                      <span>Borrar</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Componente de Paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrdenes.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}

      {/* Modal de Creación / Edición */}
      <OrdenFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOrden(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingOrden}
      />

      {/* Modal de Detalle */}
      <OrdenDetailModal
        isOpen={!!viewingOrden}
        onClose={() => setViewingOrden(null)}
        orden={viewingOrden}
        onEdit={(ord) => {
          setViewingOrden(null);
          handleOpenEdit(ord);
        }}
        onDelete={(id) => {
          setViewingOrden(null);
          setDeletingOrdenId(id);
        }}
      />

      {/* Diálogo de Confirmación para Eliminación */}
      <ConfirmDialog
        isOpen={deletingOrdenId !== null}
        title="Confirmar Eliminación"
        message={`¿Está seguro de que desea eliminar permanentemente la orden de trabajo #${deletingOrdenId}? Esta acción no se puede deshacer y requiere permisos de Administrador.`}
        confirmText="Eliminar Orden"
        cancelText="Cancelar"
        isDangerous={true}
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingOrdenId(null)}
      />
    </main>
  );
};
