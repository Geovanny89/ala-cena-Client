import { useEffect, useState } from 'react';
import { orderService } from '../../api/services';

const STATUS_LABELS = {
  pending: { label: 'Pendiente', badge: 'badge-warning', emoji: '⏳' },
  confirmed: { label: 'Confirmado', badge: 'badge-info', emoji: '✅' },
  delivered: { label: 'Entregado', badge: 'badge-success', emoji: '🎉' },
  cancelled: { label: 'Cancelado', badge: 'badge-danger', emoji: '❌' },
};

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await orderService.getAll();
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await orderService.updateStatus(id, status);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar estado');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">📋 Pedidos</h1>
          <p className="page-subtitle">
            {orders.length} pedido(s) en total •{' '}
            {orders.filter(o => o.status === 'pending').length} pendientes
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchOrders}>🔄 Actualizar</button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map((f) => (
          <button
            key={f}
            id={`btn-filter-${f}`}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todos' : STATUS_LABELS[f]?.emoji + ' ' + STATUS_LABELS[f]?.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No hay pedidos</h3>
          <p>Aún no se han realizado pedidos con este filtro.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Ficha / WhatsApp</th>
                <th>Combo / Total</th>
                <th>Comprobante</th>
                <th>Estado</th>
                <th>Cambiar Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const st = STATUS_LABELS[order.status];
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '1px' }}>
                      {order.orderCode}
                    </td>
                    <td style={{ fontWeight: 600 }}>{order.customerName}</td>
                    <td>
                      <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>{order.studentId}</span>
                      <a
                        href={`https://wa.me/57${order.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}
                      >
                        📱 {order.whatsapp}
                      </a>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      🍕 {order.combo?.pizzaFlavor?.name} + 🥤 {order.chosenSodaFlavor?.name || order.combo?.sodaFlavor?.name} ({order.sodaSize})<br />
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                        {order.quantity}x {formatPrice(order.totalPrice)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {order.receiptUrl ? (
                        <a
                          href={`https://ala-cena-api.onrender.com${order.receiptUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.6rem' }}
                        >
                          👁️ Ver pago
                        </a>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${st?.badge}`}>
                        {st?.emoji} {st?.label}
                      </span>
                    </td>
                    <td>
                      <select
                        id={`select-status-${order.id}`}
                        className="form-control"
                        style={{ padding: '0.4rem 0.7rem', fontSize: '0.82rem', width: 'auto' }}
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">⏳ Pendiente</option>
                        <option value="confirmed">✅ Confirmar</option>
                        <option value="delivered">🎉 Entregado</option>
                        <option value="cancelled">❌ Cancelar</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
