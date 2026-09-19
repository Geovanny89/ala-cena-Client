import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin' : '/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🍕 Ala<span>-Cena</span></div>
        <p className="login-subtitle">Ingresa para administrar el sistema</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-control"
              placeholder="admin@alacena.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Contraseña</label>
            <input
              id="login-password"
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : '🔑 Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--color-text-faint)' }}>
          ¿Eres cliente? <a href="/" style={{ color: 'var(--color-primary)' }}>Ver combos disponibles →</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
