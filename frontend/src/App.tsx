import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { AccessDeniedPage } from './features/auth/AccessDeniedPage';
import { OrdenesListPage } from './features/ordenes/OrdenesListPage';
import { ClientesPage } from './features/clientes/ClientesPage';
import { ServiciosPage } from './features/catalog/ServiciosPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 segundos
    },
  },
});

// Layout Principal con Header accesible y Footer
const AppLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <footer className="site-footer" role="contentinfo">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 0.5rem' }}>
            &copy; 2026 <strong>Taller Mecánico</strong>. Lenguaje Programación Web II - UT2.
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
            Seguridad OWASP (Rate Limiting, JWT Bearer, CORS restrictivo, Sanitización) &bull; Accesibilidad WCAG 2.2 Nivel AA
          </p>
        </div>
      </footer>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta Pública: Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas Privadas / Protegidas */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/ordenes" element={<OrdenesListPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/servicios" element={<ServiciosPage />} />
              <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
            </Route>

            {/* Redirecciones */}
            <Route path="/" element={<Navigate to="/ordenes" replace />} />
            <Route path="*" element={<Navigate to="/ordenes" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
