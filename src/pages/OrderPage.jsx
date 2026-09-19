import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { comboService, orderService, sodaFlavorService } from '../api/services';

const SODA_PRICES = { '7oz': 5000, '12oz': 7000 };

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

const OrderPage = () => {
  const { comboId } = useParams();
  const navigate = useNavigate();

  const [combo, setCombo] = useState(null);
  const [sodaFlavors, setSodaFlavors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Step 1: order form
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerName: '',
    studentId: '',
    whatsapp: '',
    sodaSize: '7oz',
    sodaFlavorId: '',
    quantity: 1,
  });

  // Step 2: payment modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const [receiptSent, setReceiptSent] = useState(false);

  // Final success screen
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [comboRes, sodaRes] = await Promise.all([
          comboService.getOne(comboId),
          sodaFlavorService.getAll(),
        ]);
        setCombo(comboRes.data.combo);
        const activeFlavors = sodaRes.data.flavors.filter(f => f.isActive);
        setSodaFlavors(activeFlavors);
        if (activeFlavors.length > 0) {
          setForm(prev => ({ ...prev, sodaFlavorId: activeFlavors[0].id }));
        }
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [comboId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'quantity' ? parseInt(value) || 1 : value });
  };

  // STEP 1: place order (no receipt yet)
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('comboId', comboId);
      formData.append('customerName', form.customerName);
      formData.append('studentId', form.studentId);
      formData.append('whatsapp', form.whatsapp);
      formData.append('sodaSize', form.sodaSize);
      formData.append('sodaFlavorId', form.sodaFlavorId);
      formData.append('quantity', form.quantity);

      const res = await orderService.create(formData);
      setCreatedOrder(res.data.order);
      setShowPayModal(true); // open payment modal
    } catch (err) {
      setError(err.response?.data?.message || 'Error al realizar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 2: send receipt
  const handleSendReceipt = async () => {
    if (!receipt) {
      setReceiptError('Por favor selecciona tu comprobante de pago');
      return;
    }
    setReceiptError('');
    setUploadingReceipt(true);
    try {
      const fd = new FormData();
      fd.append('receipt', receipt);
      await orderService.uploadReceipt(createdOrder.id, fd);
      setReceiptSent(true);
    } catch (err) {
      setReceiptError(err.response?.data?.message || 'Error al subir el comprobante');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleDoneModal = () => {
    setShowPayModal(false);
    setSuccess(true);
  };

  if (loading) return <div className="spinner"></div>;
  if (!combo) return null;

  // ── Final success screen ──
  if (success) {
    return (
      <div className="order-page" style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          ¡Pedido registrado!
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Tu combo de <strong>Pizza {combo.pizzaFlavor?.name}</strong> está pendiente de confirmación de pago.
        </p>

        <div style={{
          background: 'var(--color-surface-2)',
          border: '2px dashed var(--color-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'inline-block',
        }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Tu código de retiro es
          </p>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '4px' }}>
            {createdOrder?.orderCode}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-warning)', marginTop: '0.5rem' }}>
            ⚠️ Guarda este código, lo necesitarás para reclamar tu combo.
          </p>
        </div>

        <div>
          <button id="btn-back-home" className="btn btn-primary" onClick={() => navigate('/')}>
            ← Volver a los combos
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── PAYMENT MODAL ── */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💳</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                ¡Pedido realizado! No olvides pagar
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Para confirmar tu pedido, realiza el pago y envíanos el soporte
              </p>
            </div>

            {/* Order summary in modal */}
            <div style={{
              background: 'rgba(255,107,53,0.06)',
              border: '1px solid rgba(255,107,53,0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}>
              <span>🍕 <strong>Pizza {combo?.pizzaFlavor?.name}</strong></span>
              <span style={{ color: 'var(--color-text-muted)' }}>+</span>
              <span>🥤 <strong>{sodaFlavors.find(f => f.id === form.sodaFlavorId)?.name || 'Gaseosa'}</strong> ({form.sodaSize})</span>
              <span style={{ color: 'var(--color-text-muted)' }}>&middot;</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                {formatPrice(SODA_PRICES[form.sodaSize] * form.quantity)}
              </span>
            </div>

            {/* Código */}
            <div style={{
              background: 'var(--color-surface-2)',
              border: '1px dashed var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Código de pedido
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '3px' }}>
                {createdOrder?.orderCode}
              </div>
            </div>

            {/* Payment info */}
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Opciones de pago:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>🟣 Nequi</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', color: 'var(--color-primary)' }}>350 791 8591</span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>🔴 Daviplata</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', color: 'var(--color-primary)' }}>350 791 8591</span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>💳 Llave</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', color: 'var(--color-primary)' }}>@nequigeo087</span>
              </div>
            </div>

            {/* Receipt upload */}
            {!receiptSent ? (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>
                    📸 Sube tu comprobante de pago
                  </label>
                  <input
                    id="modal-receipt"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="form-control"
                    onChange={(e) => { setReceipt(e.target.files[0]); setReceiptError(''); }}
                  />
                  <small style={{ color: 'var(--color-text-muted)', display: 'block', textAlign: 'center', marginTop: '0.3rem' }}>
                    Solo imágenes JPG o PNG · Máx. 5MB
                  </small>
                </div>

                {receiptError && (
                  <div className="alert alert-error">⚠️ {receiptError}</div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={handleDoneModal}
                  >
                    Enviaré después
                  </button>
                  <button
                    id="btn-send-receipt"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    onClick={handleSendReceipt}
                    disabled={uploadingReceipt}
                  >
                    {uploadingReceipt ? 'Enviando...' : '✅ Enviar soporte'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                <p style={{ fontWeight: 700, color: 'var(--color-success)', marginBottom: '1rem' }}>
                  ¡Comprobante enviado! Estamos verificando tu pago.
                </p>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleDoneModal}>
                  Ver mi código de pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ORDER FORM ── */}
      <div className="order-page">
        <button
          id="btn-back"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/')}
          style={{ marginBottom: '1.5rem' }}
        >
          ← Volver
        </button>

        {/* Combo summary */}
        <div className="order-summary-card">
          <div className="order-summary-emoji">🍕</div>
          <div className="order-summary-details">
            <h2>Pizza {combo.pizzaFlavor?.name}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              + Gaseosa &mdash; elige el sabor y tamaño abajo
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-info">🍕 {combo.pizzaFlavor?.name}</span>
              <span className="badge badge-success">🟢 {combo.remainingQuantity} disponibles</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>📝 Datos del pedido</h2>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmitOrder}>
            <div className="form-group">
              <label htmlFor="order-name" className="form-label">Nombre completo</label>
              <input
                id="order-name" type="text" name="customerName" className="form-control"
                placeholder="Juan Carlos Pérez"
                value={form.customerName} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label htmlFor="order-student-id" className="form-label">Ficha de estudio</label>
              <input
                id="order-student-id" type="text" name="studentId" className="form-control"
                placeholder="Ej: 2024-001234"
                value={form.studentId} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label htmlFor="order-whatsapp" className="form-label">WhatsApp (número)</label>
              <input
                id="order-whatsapp" type="tel" name="whatsapp" className="form-control"
                placeholder="Ej: 3001234567"
                value={form.whatsapp} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label htmlFor="order-soda-flavor" className="form-label">Sabor de Gaseosa</label>
              <select
                id="order-soda-flavor" name="sodaFlavorId" className="form-control"
                value={form.sodaFlavorId} onChange={handleChange} required
              >
                {sodaFlavors.length === 0 ? (
                  <option value="">Cargando sabores...</option>
                ) : (
                  sodaFlavors.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="order-soda-size" className="form-label">Tamaño de Gaseosa</label>
              <select
                id="order-soda-size" name="sodaSize" className="form-control"
                value={form.sodaSize} onChange={handleChange} required
              >
                <option value="7oz">7 onzas — $5.000</option>
                <option value="12oz">12 onzas — $7.000</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="order-quantity" className="form-label">
                Cantidad (máx. {combo.remainingQuantity})
              </label>
              <input
                id="order-quantity" type="number" name="quantity" className="form-control"
                min="1" max={combo.remainingQuantity}
                value={form.quantity} onChange={handleChange} required
              />
            </div>

            {/* Total */}
            <div style={{
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Total a pagar:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {formatPrice(SODA_PRICES[form.sodaSize] * (form.quantity || 1))}
              </span>
            </div>

            <button
              id="btn-submit-order"
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? 'Procesando...' : '🛒 Hacer pedido'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default OrderPage;
