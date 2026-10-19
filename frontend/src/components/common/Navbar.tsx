import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, LogOut, User as UserIcon, Shield, Menu, X, Users, ClipboardList, BookOpen } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <header className="site-header" style={{ backgroundColor: '#0f172a', color: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div
          className="header-container"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Brand */}
          <Link
            to="/ordenes"
            className="brand-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#2563eb',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wrench aria-hidden="true" style={{ width: 22, height: 22 }} />
            </div>
            <span>Taller Mecánico</span>
          </Link>

          {/* Mobile Menu Toggle */}
          {isAuthenticated && (
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="main-nav"
              aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              style={{
                display: 'none',
                minWidth: 44,
                minHeight: 44,
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                borderRadius: '6px',
              }}
            >
              {mobileMenuOpen ? <X aria-hidden="true" style={{ width: 26, height: 26 }} /> : <Menu aria-hidden="true" style={{ width: 26, height: 26 }} />}
            </button>
          )}

          {/* Navigation Links and User Section */}
          {isAuthenticated && (
            <nav
              id="main-nav"
              aria-label="Navegación principal"
              className={`main-nav-menu ${mobileMenuOpen ? 'is-open' : ''}`}
            >
              <ul
                className="nav-list"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  gap: '1rem',
                }}
              >
                <li>
                  <NavLink
                    to="/ordenes"
                    onClick={closeMenu}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: isActive ? '#60a5fa' : '#cbd5e1',
                      textDecoration: 'none',
                      fontWeight: 600,
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      minHeight: 44,
                    })}
                  >
                    <ClipboardList aria-hidden="true" style={{ width: 18, height: 18 }} />
                    <span>Órdenes de Trabajo</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/clientes"
                    onClick={closeMenu}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: isActive ? '#60a5fa' : '#cbd5e1',
                      textDecoration: 'none',
                      fontWeight: 600,
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      minHeight: 44,
                    })}
                  >
                    <Users aria-hidden="true" style={{ width: 18, height: 18 }} />
                    <span>Clientes</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/servicios"
                    onClick={closeMenu}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: isActive ? '#60a5fa' : '#cbd5e1',
                      textDecoration: 'none',
                      fontWeight: 600,
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      minHeight: 44,
                    })}
                  >
                    <BookOpen aria-hidden="true" style={{ width: 18, height: 18 }} />
                    <span>Servicios y Repuestos</span>
                  </NavLink>
                </li>

                {/* User Info & Role Badge */}
                <li
                  className="user-profile-badge"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    backgroundColor: '#1e293b',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '20px',
                    marginLeft: '0.5rem',
                  }}
                >
                  <UserIcon aria-hidden="true" style={{ width: 16, height: 16, color: '#94a3b8' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.nombre}</span>
                  <span
                    className={`role-tag role-${user?.rol.toLowerCase()}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      backgroundColor: isAdmin ? '#4f46e5' : '#0891b2',
                      color: '#ffffff',
                    }}
                  >
                    <Shield aria-hidden="true" style={{ width: 12, height: 12 }} />
                    {user?.rol}
                  </span>
                </li>

                {/* Logout Button */}
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Cerrar sesión"
                    className="btn-logout"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      minWidth: 44,
                      minHeight: 44,
                      padding: '0.5rem 0.875rem',
                      borderRadius: '6px',
                      border: '1px solid #475569',
                      backgroundColor: 'transparent',
                      color: '#f87171',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut aria-hidden="true" style={{ width: 18, height: 18 }} />
                    <span>Salir</span>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};
