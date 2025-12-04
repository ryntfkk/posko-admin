import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import { useAuthStore } from './store/authStore';

// Import Pages
import Dashboard from './pages/dashboard/Dashboard'; // <--- INI PENTING: Import Dashboard Baru
import ProviderList from './pages/providers/ProviderList';
import ProviderDetail from './pages/providers/ProviderDetail';
import ServiceList from './pages/services/ServiceList';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import VoucherList from './pages/vouchers/VoucherList';
import FinancePage from './pages/finance/FinancePage';

// Komponen Proteksi Route
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// HAPUS KODE INI (Variable Dashboard Lama):
// const Dashboard = () => ( ... ); 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* DASHBOARD UTAMA */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard /> 
          </ProtectedRoute>
        } />
        
        {/* Module: Mitra (Provider) */}
        <Route path="/providers" element={
          <ProtectedRoute>
            <ProviderList />
          </ProtectedRoute>
        } />
        <Route path="/providers/:id" element={
          <ProtectedRoute>
            <ProviderDetail />
          </ProtectedRoute>
        } />

        {/* Module: Layanan (Service) */}
        <Route path="/services" element={
          <ProtectedRoute>
            <ServiceList />
          </ProtectedRoute>
        } />

        {/* Module: Pesanan (Order) */}
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrderList />
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        } />

        {/* Module: Voucher & Keuangan */}
        <Route path="/vouchers" element={
          <ProtectedRoute>
            <VoucherList />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <FinancePage />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;