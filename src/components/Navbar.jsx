import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Close menu when route changes
  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo" onClick={handleNavClick}>
          🍕 Ala<span>-Cena</span>
        </NavLink>

        {/* Desktop + Mobile Menu */}
        <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            onClick={handleNavClick}
          >
            🏠 Combos
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
                📊 Dashboard
              </NavLink>
              <NavLink to="/admin/pizza-flavors" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
                🍕 Pizzas
              </NavLink>
              <NavLink to="/admin/soda-flavors" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
                🥤 Gaseosas
              </NavLink>
              <NavLink to="/admin/combos" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
                📦 Combos
              </NavLink>
              <NavLink to="/admin/orders" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
                📋 Pedidos
              </NavLink>
              <NavLink to="/admin/metrics" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`} onClick={handleNavClick}>
                📈 Métricas
              </NavLink>
            </>
          )}

          {/* Auth in mobile menu */}
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '0.5rem', paddingTop: '0.75rem' }} className="mobile-only">
            {user ? (
              <>
                <div style={{ padding: '0.5rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  {isAdmin ? '👑 Admin' : user.name}
                </div>
                <button
                  className="navbar-link"
                  style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', color: 'var(--color-danger)' }}
                  onClick={handleLogout}
                >
                  🚪 Cerrar sesión
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Desktop auth */}
        <div className="navbar-user">
          {user ? (
            <>
              <span className="user-badge">{isAdmin ? '👑 Admin' : user.name.split(' ')[0]}</span>
              <button className="btn btn-secondary btn-sm" id="btn-logout" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : null}
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
          <span style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'translateX(-10px)' : 'none' }}></span>
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
