import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccessDeniedPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const state = location.state as { requiredRoles?: string[]; currentRole?: string } | null;

  return (
    <main
      id="main-content"
      role="main"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '2rem 1rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <ShieldAlert aria-hidden="true" style={{ width: 36, height: 36 }} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
          403 - Acceso Denegado
        </h1>

        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          No posee los privilegios suficientes para acceder a este recurso o ejecutar esta operación.
        </p>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
            fontSize: '0.9rem',
            color: '#334155',
          }}
        >
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>Usuario conectado:</strong> {user?.nombre || 'Desconocido'}
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>Rol actual:</strong>{' '}
            <span
              style={{
                backgroundColor: '#e2e8f0',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              {user?.rol || state?.currentRole || 'N/A'}
            </span>
          </p>
          {state?.requiredRoles && (
            <p style={{ margin: 0 }}>
              <strong>Roles requeridos:</strong> {state.requiredRoles.join(', ')}
            </p>
          )}
        </div>

        <Link
          to="/ordenes"
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            minHeight: 44,
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          <ArrowLeft aria-hidden="true" style={{ width: 18, height: 18 }} />
          <span>Volver al Listado de Órdenes</span>
        </Link>
      </div>
    </main>
  );
};

