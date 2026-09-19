import { useEffect, useState } from 'react';
import { comboService, pizzaFlavorService, sodaFlavorService } from '../../api/services';

const Combos = () => {
  const [combos, setCombos] = useState([]);
  const [pizzaFlavors, setPizzaFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    pizzaFlavorId: '',
    totalQuantity: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAll = async () => {
    try {
      const [c, p] = await Promise.all([
        comboService.getAll(true),
        pizzaFlavorService.getAll(),
      ]);
      setCombos(c.data.combos);
      setPizzaFlavors(p.data.flavors.filter(f => f.isActive));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ pizzaFlavorId: '', totalQuantity: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (combo) => {
    setEditing(combo);
    setForm({
      pizzaFlavorId: combo.pizzaFlavorId,
      totalQuantity: combo.totalQuantity,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editing) {
        await comboService.update(editing.id, form);
        setSuccess('Combo actualizado correctamente');
      } else {
        await comboService.create(form);
        setSuccess('Combo creado correctamente');
      }
      setShowModal(false);
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este combo?')) return;
    try {
      await comboService.remove(id);
      fetchAll();
      setSuccess('Combo eliminado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const toggleActive = async (combo) => {
    try {
      await comboService.update(combo.id, { isActive: !combo.isActive });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">📦 Combos</h1>
          <p className="page-subtitle">Gestiona los combos de pizza + gaseosa</p>
        </div>
        <button id="btn-create-combo" className="btn btn-primary" onClick={openCreate}>
          + Nuevo Combo
        </button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && !showModal && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pizza</th>
                <th>Detalle</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {combos.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No hay combos registrados
                  </td>
                </tr>
              ) : (
                combos.map((combo) => (
                  <tr key={combo.id}>
                    <td style={{ fontWeight: 600 }}>🍕 {combo.pizzaFlavor?.name}</td>
                    <td>+ Gaseosa (a elección)</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: combo.remainingQuantity === 0
                          ? 'var(--color-danger)'
                          : combo.remainingQuantity <= 3
                          ? 'var(--color-warning)'
                          : 'var(--color-success)'
                      }}>
                        {combo.remainingQuantity} / {combo.totalQuantity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${combo.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {combo.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          id={`btn-edit-combo-${combo.id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(combo)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleActive(combo)}
                          title={combo.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {combo.isActive ? '🔴' : '🟢'}
                        </button>
                        <button
                          id={`btn-delete-combo-${combo.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(combo.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? '✏️ Editar Combo' : '+ Nuevo Combo'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Sabor de Pizza</label>
                <select
                  id="modal-combo-pizza"
                  className="form-control"
                  value={form.pizzaFlavorId}
                  onChange={(e) => setForm({ ...form, pizzaFlavorId: e.target.value })}
                  required
                >
                  <option value="">Selecciona un sabor...</option>
                  {pizzaFlavors.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>



              <div className="form-group">
                <label className="form-label">Cantidad de combos a preparar</label>
                <input
                  id="modal-combo-quantity"
                  type="number"
                  className="form-control"
                  placeholder="Ej: 20"
                  min="1"
                  value={form.totalQuantity}
                  onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button id="btn-save-combo" type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : '💾 Guardar Combo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Combos;
