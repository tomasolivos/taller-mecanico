import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../../services/catalogService';
import { Cliente, ClienteDTO } from '../../types/catalog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, User, Phone, Mail, MapPin } from 'lucide-react';
import { ApiErrorDetail } from '../../types/api';

const clienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres.'),
  telefono: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos.').optional().or(z.literal('')),
  correo: z.string().email('Debe ser un correo electrónico válido.').optional().or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

export const ClientesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    data: clientes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Cliente[], ApiErrorDetail>({
    queryKey: ['clientes'],
    queryFn: catalogService.getClientes,
  });

  const createMutation = useMutation({
    mutationFn: (dto: ClienteDTO) => catalogService.createCliente(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsModalOpen(false);
      reset();
      setFeedback({ type: 'success', message: 'Cliente registrado exitosamente.' });
    },
    onError: (err: ApiErrorDetail) => {
      setFeedback({ type: 'error', message: err.message });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      direccion: '',
    },
  });

  const filteredClientes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return clientes;
    return clientes.filter((c) =>
      `${c.nombre} ${c.apellido} ${c.correo || ''} ${c.telefono || ''}`
        .toLowerCase()
        .includes(term)
    );
  }, [clientes, searchTerm]);

  const handleFormSubmit = (data: ClienteFormData) => {
    createMutation.mutate({
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono || undefined,
      correo: data.correo || undefined,
      direccion: data.direccion || undefined,
    });
  };

  return (
    <main id="main-content" role="main" className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

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
            Clientes del Taller
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Directorio de propietarios asociados a vehículos y órdenes de trabajo
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
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
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Buscador */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Search
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '20px',
            width: 18,
            height: 18,
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente por nombre, apellido, correo o teléfono..."
          aria-label="Buscar cliente"
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

      {/* Estados */}
      {isLoading ? (
        <LoadingSpinner message="Cargando directorio de clientes..." />
      ) : isError ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Alert type="error" message={error?.message || 'Error al obtener clientes.'} />
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
            Reintentar
          </button>
        </div>
      ) : filteredClientes.length === 0 ? (
        <EmptyState
          title="No se encontraron clientes"
          description={searchTerm ? 'No hay clientes que coincidan con la búsqueda.' : 'Aún no hay clientes registrados.'}
          actionText={searchTerm ? 'Limpiar Búsqueda' : 'Registrar Cliente'}
          onAction={() => (searchTerm ? setSearchTerm('') : setIsModalOpen(true))}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredClientes.map((c) => (
            <article
              key={c.clienteId}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    padding: '0.625rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User aria-hidden="true" style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    {c.nombre} {c.apellido}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ID Cliente #{c.clienteId}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.9rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone aria-hidden="true" style={{ width: 16, height: 16, color: '#94a3b8' }} />
                  <span>{c.telefono || 'Sin teléfono'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail aria-hidden="true" style={{ width: 16, height: 16, color: '#94a3b8' }} />
                  <span>{c.correo || 'Sin correo'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin aria-hidden="true" style={{ width: 16, height: 16, color: '#94a3b8' }} />
                  <span>{c.direccion || 'Sin dirección'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Crear Cliente */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Cliente" size="sm">
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor="cli-nombre" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Nombre *</label>
            <input
              id="cli-nombre"
              type="text"
              {...register('nombre')}
              aria-required="true"
              aria-invalid={errors.nombre ? 'true' : 'false'}
              style={{ minHeight: 44, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            {errors.nombre && <span style={{ color: '#dc2626', fontSize: '0.825rem' }}>{errors.nombre.message}</span>}
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor="cli-apellido" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Apellido *</label>
            <input
              id="cli-apellido"
              type="text"
              {...register('apellido')}
              aria-required="true"
              aria-invalid={errors.apellido ? 'true' : 'false'}
              style={{ minHeight: 44, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            {errors.apellido && <span style={{ color: '#dc2626', fontSize: '0.825rem' }}>{errors.apellido.message}</span>}
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor="cli-correo" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Correo Electrónico</label>
            <input
              id="cli-correo"
              type="email"
              {...register('correo')}
              style={{ minHeight: 44, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            {errors.correo && <span style={{ color: '#dc2626', fontSize: '0.825rem' }}>{errors.correo.message}</span>}
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor="cli-tel" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Teléfono</label>
            <input
              id="cli-tel"
              type="tel"
              {...register('telefono')}
              style={{ minHeight: 44, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
            {errors.telefono && <span style={{ color: '#dc2626', fontSize: '0.825rem' }}>{errors.telefono.message}</span>}
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor="cli-dir" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dirección</label>
            <input
              id="cli-dir"
              type="text"
              {...register('direccion')}
              style={{ minHeight: 44, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
              style={{ minHeight: 44, padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary"
              style={{ minHeight: 44, padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              {createMutation.isPending ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

