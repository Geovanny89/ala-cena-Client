import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pizzaFlavorService, sodaFlavorService, comboService, orderService } from '../../api/services';

const Dashboard = () => {
  const [stats, setStats] = useState({
    pizzaFlavors: 0,
    sodaFlavors: 0,
    combos: 0,
    orders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pizza, soda, combos, orders] = await Promise.all([
          pizzaFlavorService.getAll(),
          sodaFlavorService.getAll(),
          comboService.getAll(true),
          orderService.getAll(),
        ]);
        setStats({
          pizzaFlavors: pizza.data.flavors.length,
          sodaFlavors: soda.data.flavors.length,
          combos: combos.data.combos.length,
          orders: orders.data.orders.length,
          pendingOrders: orders.data.orders.filter(o => o.status === 'pending').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    { icon: '🍕', label: 'Sabores de Pizza', value: stats.pizzaFlavors, link: '/admin/pizza-flavors', color: '#ff6b35' },
    { icon: '🥤', label: 'Sabores de Gaseosa', value: stats.sodaFlavors, link: '/admin/soda-flavors', color: '#ffd23f' },
    { icon: '📦', label: 'Combos Activos', value: stats.combos, link: '/admin/combos', color: '#a855f7' },
    { icon: '📋', label: 'Total Pedidos', value: stats.orders, link: '/admin/orders', color: '#22c55e' },
    { icon: '⏳', label: 'Pedidos Pendientes', value: stats.pendingOrders, link: '/admin/orders', color: '#f59e0b' },
  ];

  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">👑 Panel de Administración</h1>
          <p className="page-subtitle">Bienvenido al sistema Ala-Cena</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="stat-cards">
            {statItems.map((item) => (
              <Link to={item.link} key={item.label} style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer' }}>
                  <div className="stat-icon">{item.icon}</div>
                  <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
                  <div className="stat-label">{item.label}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick actions */}
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>⚡ Acciones Rápidas</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/admin/combos" className="btn btn-primary">📦 Crear nuevo combo</Link>
              <Link to="/admin/pizza-flavors" className="btn btn-secondary">🍕 Agregar sabor de pizza</Link>
              <Link to="/admin/soda-flavors" className="btn btn-secondary">🥤 Agregar sabor de gaseosa</Link>
              <Link to="/admin/orders" className="btn btn-secondary">📋 Ver pedidos</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
