import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TecnicoLayout from './layouts/TecnicoLayout';
import ClienteLayout from './layouts/ClienteLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Inventory from './pages/admin/Inventory';
import RepairHistory from './pages/admin/RepairHistory';
import Purchases from './pages/admin/Purchases';
import TecnicoDashboard from './pages/tecnico/TecnicoDashboard';
import NewOrder from './pages/tecnico/NewOrder';
import Tracking from './pages/cliente/Tracking';
import ClienteDashboard from './pages/cliente/ClienteDashboard';
import Factura from './pages/cliente/Factura';
import Perfil from './pages/cliente/Perfil';
import Valoracion from './pages/cliente/Valoracion';
import Tienda from './pages/cliente/Tienda';
import Carrito from './pages/cliente/Carrito';
import MisCompras from './pages/cliente/MisCompras';
import CompraDetalle from './pages/cliente/CompraDetalle';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#f1f5f9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
            },
          }}
        />
        
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tracking" element={<Tracking />} />
          
          {/* Rutas Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="history" element={<RepairHistory />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="factura/:orderId" element={<Factura />} />
            <Route path="compra/:purchaseId" element={<CompraDetalle />} />
          </Route>
          
          {/* Rutas Técnico */}
          <Route path="/tecnico" element={
            <ProtectedRoute allowedRoles={['TECNICO', 'ROLE_TECNICO', 'ADMIN', 'ROLE_ADMIN']}>
              <TecnicoLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TecnicoDashboard />} />
            <Route path="new-order" element={<NewOrder />} />
          </Route>
          
          {/* Rutas Cliente */}
          <Route path="/cliente" element={
            <ProtectedRoute allowedRoles={['CLIENTE', 'ROLE_CLIENTE']}>
              <ClienteLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClienteDashboard />} />
            <Route path="tienda" element={<Tienda />} />
            <Route path="carrito" element={<Carrito />} />
            <Route path="mis-compras" element={<MisCompras />} />
            <Route path="compra/:purchaseId" element={<CompraDetalle />} />
            <Route path="tracking" element={<Tracking />} />
            <Route path="factura/:orderId" element={<Factura />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="valorar/:orderId" element={<Valoracion />} />
          </Route>
          
          {/* Redirect default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
