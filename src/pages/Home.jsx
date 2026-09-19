import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { comboService } from '../api/services';


const Home = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const res = await comboService.getAll(false);
      setCombos(res.data.combos.filter(c => c.remainingQuantity > 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCombos(); }, []);

  const getStockStatus = (remaining) => {
    if (remaining === 0) return 'empty';
    if (remaining <= 3) return 'low';
    return 'ok';
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-decorations">
          <div className="glow-orb glow-orb-1"></div>
        </div>
        <h1 className="hero-title">¡Combos de Pizza 🍕<br />para tu descanso!</h1>
        <p className="hero-subtitle">
          Elige tu combo favorito: porción de pizza + gaseosa a un precio increíble.
          Disponible solo mientras duren las unidades.
        </p>
      </div>

      {/* Combos */}
      {loading ? (
        <div className="spinner"></div>
      ) : combos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">😔</div>
          <h3>No hay combos disponibles</h3>
          <p>Vuelve pronto, ¡pronto habrá nuevas opciones!</p>
        </div>
      ) : (
        <div className="card-grid">
          {combos.map((combo) => {
            const stockStatus = getStockStatus(combo.remainingQuantity);
            return (
              <div key={combo.id} className="combo-card">
                <div className="combo-card-badge">
                  ⭐ Popular
                </div>
                <div className="combo-card-image">🍕</div>
                <div className="combo-card-body">
                  <h3 className="combo-card-title">
                    Pizza {combo.pizzaFlavor?.name}
                  </h3>
                  <p className="combo-card-desc">
                    {combo.pizzaFlavor?.description || 'Deliciosa porción de pizza'} + Gaseosa (a elección)
                  </p>
                  <div className="combo-card-price">Desde $5.000</div>
                  <div className="combo-card-stock">
                    <span className={`stock-dot ${stockStatus}`}></span>
                    {stockStatus === 'empty'
                      ? 'Agotado'
                      : stockStatus === 'low'
                      ? `¡Solo quedan ${combo.remainingQuantity}!`
                      : `${combo.remainingQuantity} disponibles`}
                  </div>
                  <button
                    id={`btn-order-${combo.id}`}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => navigate(`/order/${combo.id}`)}
                    disabled={combo.remainingQuantity === 0}
                  >
                    🛒 ¡Quiero este combo!
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
