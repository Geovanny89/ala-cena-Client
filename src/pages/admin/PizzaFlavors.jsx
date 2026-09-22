import { useEffect, useState } from 'react';
import { pizzaFlavorService } from '../../api/services';

const PizzaFlavors = () => {
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchFlavors = async () => {
    try {
      const res = await pizzaFlavorService.getAll();
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
    setForm({ name: '', description: '' });
    setImageFile(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (flavor) => {
    setEditing(flavor);
    setForm({ name: flavor.name, description: flavor.description || '' });
    setImageFile(null);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (imageFile) formData.append('image', imageFile);

      if (editing) {
        await pizzaFlavorService.update(editing.id, formData);
        setSuccess('Sabor actualizado correctamente');
      } else {
        await pizzaFlavorService.create(formData);
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
      await pizzaFlavorService.remove(id);
      fetchFlavors();
      setSuccess('Sabor eliminado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const toggleActive = async (flavor) => {
    try {
      await pizzaFlavorService.update(flavor.id, { isActive: !flavor.isActive });
      fetchFlavors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">🍕 Sabores de Pizza</h1>
          <p className="page-subtitle">Gestiona los sabores disponibles</p>
        </div>
        <button id="btn-create-pizza-flavor" className="btn btn-primary" onClick={openCreate}>
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
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {flavors.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No hay sabores registrados
                  </td>
                </tr>
              ) : (
                flavors.map((flavor) => (
                  <tr key={flavor.id}>
                    <td style={{ fontWeight: 600 }}>
                      {flavor.imageUrl ? (
                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${flavor.imageUrl}`}
                          alt={flavor.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', marginRight: '0.5rem', verticalAlign: 'middle' }}
                        />
                      ) : '🍕 '}
                      {flavor.name}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{flavor.description || '—'}</td>
                    <td>
                      <span className={`badge ${flavor.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {flavor.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          id={`btn-edit-pizza-${flavor.id}`}
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
                          id={`btn-delete-pizza-${flavor.id}`}
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
              <h3 className="modal-title">{editing ? '✏️ Editar Sabor' : '+ Nuevo Sabor de Pizza'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre del sabor</label>
                <input
                  id="modal-pizza-name"
                  type="text"
                  className="form-control"
                  placeholder="Ej: Pepperoni, BBQ, Hawaiana..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción (opcional)</label>
                <textarea
                  id="modal-pizza-description"
                  className="form-control"
                  placeholder="Describe los ingredientes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Imagen de la pizza (opcional)</label>
                {editing?.imageUrl && !imageFile && (
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${editing.imageUrl}`}
                    alt="Imagen actual"
                    style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }}
                  />
                )}
                <input
                  id="modal-pizza-image"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="form-control"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
                <small style={{ color: 'var(--color-text-muted)' }}>JPG, PNG o WEBP · Máx. 5MB</small>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button id="btn-save-pizza-flavor" type="submit" className="btn btn-primary" disabled={submitting}>
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

export default PizzaFlavors;
