import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiErrorDetail } from '../../types/api';
import { Alert } from '../../components/common/Alert';
import { Wrench, Lock, User, Eye, EyeOff, ShieldCheck, UserCog } from 'lucide-react';

const loginSchema = z.object({
  nombreUsuario: z
    .string()
    .min(1, 'El nombre de usuario es obligatorio.')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres.'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria.')
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nombreUsuario: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login(data);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/ordenes';
      navigate(from, { replace: true });
    } catch (err) {
      const apiErr = err as ApiErrorDetail;
      if (apiErr.statusCode === 401) {
        setErrorMessage('Credenciales inválidas. Verifique su usuario y contraseña.');
      } else if (apiErr.statusCode === 429) {
        setErrorMessage('Demasiados intentos de inicio de sesión. Por motivos de seguridad (Rate Limiting OWASP), espere 1 minuto antes de reintentar.');
      } else {
        setErrorMessage(apiErr.message || 'Error al iniciar sesión. Intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (user: 'admin' | 'mecanico') => {
    setValue('nombreUsuario', user);
    setValue('password', 'Password123!', { shouldValidate: true });
  };

  return (
    <main
      id="main-content"
      role="main"
      className="login-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '1.5rem 1rem',
      }}
    >
      <div
        className="login-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Wrench aria-hidden="true" style={{ width: 30, height: 30 }} />
          </div>
          <h1
            id="login-title"
            style={{
              fontSize: '1.625rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 0.5rem',
            }}
          >
            Taller Mecánico
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Acceso al Sistema de Gestión y Órdenes
          </p>
        </div>

        {errorMessage && (
          <Alert
            type="error"
            title="Fallo de autenticación"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        <form
          aria-labelledby="login-title"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {/* Campo Usuario */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label
              htmlFor="nombreUsuario"
              style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}
            >
              Nombre de Usuario <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User
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
                id="nombreUsuario"
                type="text"
                autoComplete="username"
                {...register('nombreUsuario')}
                aria-required="true"
                aria-invalid={errors.nombreUsuario ? 'true' : 'false'}
                aria-describedby={errors.nombreUsuario ? 'nombreUsuario-error' : undefined}
                placeholder="Ej. admin o mecanico"
                style={{
                  width: '100%',
                  minHeight: 44,
                  padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                  borderRadius: '6px',
                  border: `1px solid ${errors.nombreUsuario ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '1rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </div>
            {errors.nombreUsuario && (
              <span
                id="nombreUsuario-error"
                role="alert"
                aria-live="polite"
                style={{ color: '#dc2626', fontSize: '0.825rem', marginTop: '0.2rem' }}
              >
                {errors.nombreUsuario.message}
              </span>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label
              htmlFor="password"
              style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}
            >
              Contraseña <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock
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
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                aria-required="true"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  minHeight: 44,
                  padding: '0.625rem 2.75rem 0.625rem 2.5rem',
                  borderRadius: '6px',
                  border: `1px solid ${errors.password ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '1rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                style={{
                  position: 'absolute',
                  right: 0,
                  minWidth: 44,
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" style={{ width: 18, height: 18 }} />
                ) : (
                  <Eye aria-hidden="true" style={{ width: 18, height: 18 }} />
                )}
              </button>
            </div>
            {errors.password && (
              <span
                id="password-error"
                role="alert"
                aria-live="polite"
                style={{ color: '#dc2626', fontSize: '0.825rem', marginTop: '0.2rem' }}
              >
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              minHeight: 44,
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Acceso Rápido para Demostración */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <p
            style={{
              fontSize: '0.825rem',
              color: '#64748b',
              textAlign: 'center',
              marginBottom: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Credenciales de Prueba (Demostración)
          </p>
          <div className="demo-buttons-grid" style={{ display: 'grid', gap: '0.625rem' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="btn btn-demo"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                minHeight: 44,
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ShieldCheck aria-hidden="true" style={{ width: 16, height: 16, color: '#4f46e5' }} />
              <span>Rol Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('mecanico')}
              className="btn btn-demo"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                minHeight: 44,
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <UserCog aria-hidden="true" style={{ width: 16, height: 16, color: '#0891b2' }} />
              <span>Rol Mecánico</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

