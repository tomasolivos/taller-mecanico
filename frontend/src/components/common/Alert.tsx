import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  errorsList?: string[];
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  errorsList,
}) => {
  const config = {
    error: {
      bgColor: '#fef2f2',
      borderColor: '#ef4444',
      textColor: '#991b1b',
      icon: AlertCircle,
      defaultTitle: 'Error',
    },
    warning: {
      bgColor: '#fffbeb',
      borderColor: '#f59e0b',
      textColor: '#92400e',
      icon: AlertTriangle,
      defaultTitle: 'Advertencia',
    },
    success: {
      bgColor: '#f0fdf4',
      borderColor: '#22c55e',
      textColor: '#166534',
      icon: CheckCircle,
      defaultTitle: 'Éxito',
    },
    info: {
      bgColor: '#eff6ff',
      borderColor: '#3b82f6',
      textColor: '#1e40af',
      icon: Info,
      defaultTitle: 'Información',
    },
  }[type];

  const IconComponent = config.icon;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`alert-box alert-${type}`}
      style={{
        backgroundColor: config.bgColor,
        borderLeft: `5px solid ${config.borderColor}`,
        color: config.textColor,
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}
    >
      <IconComponent
        aria-hidden="true"
        style={{ width: 22, height: 22, flexShrink: 0, marginTop: '2px' }}
      />
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
          {title || config.defaultTitle}
        </strong>
        <p style={{ margin: 0, fontSize: '0.925rem', lineHeight: 1.4 }}>{message}</p>
        {errorsList && errorsList.length > 0 && (
          <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, fontSize: '0.875rem' }}>
            {errorsList.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            minWidth: 44,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.textColor,
          }}
        >
          <X aria-hidden="true" style={{ width: 18, height: 18 }} />
        </button>
      )}
    </div>
  );
};

