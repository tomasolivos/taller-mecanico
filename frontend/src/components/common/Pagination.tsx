import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav
      aria-label="Paginación de resultados"
      className="pagination-container"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 0',
        gap: '1rem',
      }}
    >
      <span style={{ fontSize: '0.875rem', color: '#475569' }}>
        Mostrando <strong>{startItem}</strong> - <strong>{endItem}</strong> de{' '}
        <strong>{totalItems}</strong> registros
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className="btn-pagination"
          style={{
            minWidth: 44,
            minHeight: 44,
            padding: '0 0.75rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
            color: currentPage === 1 ? '#94a3b8' : '#334155',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
          }}
        >
          <ChevronLeft aria-hidden="true" style={{ width: 18, height: 18 }} />
          <span style={{ marginLeft: 4 }}>Anterior</span>
        </button>

        <span
          aria-current="page"
          style={{
            minWidth: 44,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: '#1e293b',
          }}
        >
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
          className="btn-pagination"
          style={{
            minWidth: 44,
            minHeight: 44,
            padding: '0 0.75rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
            color: currentPage === totalPages ? '#94a3b8' : '#334155',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
          }}
        >
          <span style={{ marginRight: 4 }}>Siguiente</span>
          <ChevronRight aria-hidden="true" style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </nav>
  );
};

