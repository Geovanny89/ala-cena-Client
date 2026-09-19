import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Home from '../pages/Home';
import OrderPage from '../pages/OrderPage';
import Dashboard from '../pages/admin/Dashboard';
import PizzaFlavors from '../pages/admin/PizzaFlavors';
import SodaFlavors from '../pages/admin/SodaFlavors';
import Combos from '../pages/admin/Combos';
import Orders from '../pages/admin/Orders';
import CrmMetrics from '../pages/admin/CrmMetrics';
import Navbar from '../components/Navbar';

const ProtectedAdmin = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/order/:comboId" element={<OrderPage />} />

        {/* Rutas de admin */}
        <Route path="/admin" element={<ProtectedAdmin><Dashboard /></ProtectedAdmin>} />
        <Route path="/admin/pizza-flavors" element={<ProtectedAdmin><PizzaFlavors /></ProtectedAdmin>} />
        <Route path="/admin/soda-flavors" element={<ProtectedAdmin><SodaFlavors /></ProtectedAdmin>} />
        <Route path="/admin/combos" element={<ProtectedAdmin><Combos /></ProtectedAdmin>} />
        <Route path="/admin/orders" element={<ProtectedAdmin><Orders /></ProtectedAdmin>} />
        <Route path="/admin/metrics" element={<ProtectedAdmin><CrmMetrics /></ProtectedAdmin>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
