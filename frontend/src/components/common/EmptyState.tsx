import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No se encontraron registros',
  description = 'No hay datos disponibles que coincidan con los criterios de búsqueda.',
  actionText,
  onAction,
}) => {
  return (
    <div
      role="region"
      aria-label="Estado vacío"
      className="empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '2px dashed #cbd5e1',
        margin: '1.5rem 0',
      }}
    >
      <Inbox aria-hidden="true" style={{ width: 48, height: 48, color: '#94a3b8', marginBottom: '1rem' }} />
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: '#1e293b' }}>{title}</h3>
      <p style={{ margin: '0 0 1.25rem', color: '#64748b', maxWidth: '400px', fontSize: '0.95rem' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary"
          style={{
            minHeight: 44,
            padding: '0.625rem 1.25rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
