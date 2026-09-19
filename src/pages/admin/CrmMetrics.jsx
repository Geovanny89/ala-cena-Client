import { useEffect, useState } from 'react';
import { orderService } from '../../api/services';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

const CrmMetrics = () => {
  const [metrics, setMetrics] = useState({ todaySales: 0, todayCount: 0, customers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  // Calcular datos paginados
  const totalPages = Math.ceil(metrics.customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = metrics.customers.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">📊 Métricas y CRM</h1>
          <p className="page-subtitle">Resumen de ventas y fidelidad de clientes</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchMetrics}>🔄 Actualizar</button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Tarjetas de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center', borderLeft: '4px solid var(--color-primary)' }}>
          <h3 style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Ventas de Hoy
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>
            {formatPrice(metrics.todaySales)}
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Dinero ingresado hoy
          </p>
        </div>

        <div className="card" style={{ padding: '2rem', textAlign: 'center', borderLeft: '4px solid var(--color-success)' }}>
          <h3 style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Pedidos Exitosos
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-success)' }}>
            {metrics.todayCount}
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Pedidos completados hoy
          </p>
        </div>
      </div>

      {/* Tabla CRM */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>👥 Directorio de Clientes</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {metrics.customers.length} clientes únicos registrados
          </p>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>WhatsApp</th>
                <th>Ficha de Estudio</th>
                <th style={{ textAlign: 'center' }}>Total Pedidos</th>
                <th style={{ textAlign: 'right' }}>Total Invertido</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No hay datos de clientes aún.
                  </td>
                </tr>
              ) : (
                currentCustomers.map((customer) => (
                  <tr key={customer.whatsapp}>
                    <td style={{ fontWeight: 600 }}>{customer.customerName}</td>
                    <td>
                      <a
                        href={`https://wa.me/57${customer.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--color-success)', fontWeight: 600 }}
                      >
                        📱 {customer.whatsapp}
                      </a>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{customer.studentId}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-info" style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
                        {customer.ordersCount}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {formatPrice(customer.totalSpent)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, metrics.customers.length)} de {metrics.customers.length} clientes
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmMetrics;
