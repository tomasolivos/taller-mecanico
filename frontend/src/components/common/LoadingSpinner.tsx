import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando información...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="loading-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '0.75rem',
      }}
    >
      <Loader2
        className={`spinner-icon ${sizeClasses[size]}`}
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--primary-color, #2563eb)',
          width: size === 'sm' ? 20 : size === 'lg' ? 48 : 32,
          height: size === 'sm' ? 20 : size === 'lg' ? 48 : 32,
        }}
        aria-hidden="true"
      />
      <span style={{ fontSize: '0.95rem', color: 'var(--text-muted, #475569)' }}>
        {message}
      </span>
      <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        Cargando datos
      </span>
    </div>
  );
};

