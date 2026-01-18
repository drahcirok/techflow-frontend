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
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import TecnicoDashboard from './pages/tecnico/TecnicoDashboard';
import NewOrder from './pages/tecnico/NewOrder';
import Inventory from './pages/tecnico/Inventory';
import Tracking from './pages/cliente/Tracking';

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
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f1f5f9',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f1f5f9',
              },
            },
          }}
        />
        
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
          </Route>
          
          {/* Rutas Técnico */}
          <Route path="/tecnico" element={
            <ProtectedRoute allowedRoles={['TECNICO', 'ADMIN']}>
              <TecnicoLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TecnicoDashboard />} />
            <Route path="new-order" element={<NewOrder />} />
            <Route path="inventory" element={<Inventory />} />
          </Route>
          
          {/* Rutas Cliente */}
          <Route path="/cliente" element={
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <ClienteLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="tracking" replace />} />
            <Route path="tracking" element={<Tracking />} />
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
