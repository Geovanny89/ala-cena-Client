import { useEffect, useState } from 'react';
import { sodaFlavorService } from '../../api/services';

const SodaFlavors = () => {
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchFlavors = async () => {
    try {
      const res = await sodaFlavorService.getAll();
      setFlavors(res.data.flavors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFlavors(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (flavor) => {
    setEditing(flavor);
    setForm({ name: flavor.name });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editing) {
        await sodaFlavorService.update(editing.id, form);
        setSuccess('Sabor actualizado correctamente');
      } else {
        await sodaFlavorService.create(form);
        setSuccess('Sabor creado correctamente');
      }
      setShowModal(false);
      fetchFlavors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este sabor?')) return;
    try {
      await sodaFlavorService.remove(id);
      fetchFlavors();
      setSuccess('Sabor eliminado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const toggleActive = async (flavor) => {
    try {
      await sodaFlavorService.update(flavor.id, { isActive: !flavor.isActive });
      fetchFlavors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">🥤 Sabores de Gaseosa</h1>
          <p className="page-subtitle">Gestiona las gaseosas disponibles</p>
        </div>
        <button id="btn-create-soda-flavor" className="btn btn-primary" onClick={openCreate}>
          + Agregar Sabor
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
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {flavors.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No hay sabores registrados
                  </td>
                </tr>
              ) : (
                flavors.map((flavor) => (
                  <tr key={flavor.id}>
                    <td style={{ fontWeight: 600 }}>🥤 {flavor.name}</td>
                    <td>
                      <span className={`badge ${flavor.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {flavor.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          id={`btn-edit-soda-${flavor.id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(flavor)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleActive(flavor)}
                        >
                          {flavor.isActive ? '🔴 Desactivar' : '🟢 Activar'}
                        </button>
                        <button
                          id={`btn-delete-soda-${flavor.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(flavor.id)}
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
              <h3 className="modal-title">{editing ? '✏️ Editar Sabor' : '+ Nuevo Sabor de Gaseosa'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre de la gaseosa</label>
                <input
                  id="modal-soda-name"
                  type="text"
                  className="form-control"
                  placeholder="Ej: Coca-Cola, Pepsi, Manzana..."
                  value={form.name}
                  onChange={(e) => setForm({ name: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button id="btn-save-soda-flavor" type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : '💾 Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SodaFlavors;
