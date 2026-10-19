import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../services/catalogService';
import { Servicio, Repuesto } from '../../types/catalog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { Wrench, Package, DollarSign } from 'lucide-react';
import { ApiErrorDetail } from '../../types/api';

export const ServiciosPage: React.FC = () => {
  const {
    data: servicios = [],
    isLoading: loadingServicios,
    error: errorServicios,
  } = useQuery<Servicio[], ApiErrorDetail>({
    queryKey: ['servicios'],
    queryFn: catalogService.getServicios,
  });

  const {
    data: repuestos = [],
    isLoading: loadingRepuestos,
    error: errorRepuestos,
  } = useQuery<Repuesto[], ApiErrorDetail>({
    queryKey: ['repuestos'],
    queryFn: catalogService.getRepuestos,
  });

  const isLoading = loadingServicios || loadingRepuestos;

  return (
    <main id="main-content" role="main" className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Servicios y Repuestos del Taller
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Catálogos de mano de obra y repuestos en inventario disponibles para las órdenes
        </p>
      </div>

      {(errorServicios || errorRepuestos) && (
        <Alert
          type="error"
          title="Error de Catálogo"
          message="No se pudieron cargar completamente los servicios o repuestos del taller."
        />
      )}

      {isLoading ? (
        <LoadingSpinner message="Cargando catálogo de servicios y repuestos..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Servicios */}
          <section aria-labelledby="servicios-heading">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Wrench aria-hidden="true" style={{ width: 22, height: 22, color: '#2563eb' }} />
              <h2 id="servicios-heading" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                Servicios Disponibles ({servicios.length})
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {servicios.map((s) => (
                <div
                  key={s.servicioId}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                      {s.nombre}
                    </h3>
                    <span
                      style={{
                        backgroundColor: '#ecfdf5',
                        color: '#047857',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <DollarSign aria-hidden="true" style={{ width: 14, height: 14 }} />
                      {Number(s.costo).toLocaleString('es-CL')}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                    {s.descripcion || 'Sin descripción'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Repuestos */}
          <section aria-labelledby="repuestos-heading">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Package aria-hidden="true" style={{ width: 22, height: 22, color: '#0891b2' }} />
              <h2 id="repuestos-heading" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                Repuestos en Inventario ({repuestos.length})
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {repuestos.map((r) => (
                <div
                  key={r.repuestoId}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                      {r.nombre}
                    </h3>
                    <span
                      style={{
                        backgroundColor: '#f0f9ff',
                        color: '#0369a1',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <DollarSign aria-hidden="true" style={{ width: 14, height: 14 }} />
                      {Number(r.precio).toLocaleString('es-CL')}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                    {r.descripcion || 'Sin descripción'}
                  </p>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: r.stock > 5 ? '#166534' : '#b45309',
                      backgroundColor: r.stock > 5 ? '#f0fdf4' : '#fffbeb',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                    }}
                  >
                    Stock disponible: {r.stock} unidades
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
};
