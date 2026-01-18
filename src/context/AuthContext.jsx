import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

// Función para decodificar JWT y extraer payload
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (token) {
      // Si hay token pero no user, decodificar el token
      const decoded = decodeToken(token);
      if (decoded) {
        const userData = {
          id: decoded.sub || decoded.id,
          email: decoded.email || decoded.sub,
          name: decoded.name || decoded.email?.split('@')[0] || 'Usuario',
          role: decoded.role || 'TECNICO',
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { token } = response.data;
    
    localStorage.setItem('token', token);
    
    // Decodificar token para obtener info del usuario
    const decoded = decodeToken(token);
    const userData = {
      id: decoded?.sub || decoded?.id || 1,
      email: decoded?.email || email,
      name: decoded?.name || email.split('@')[0],
      role: decoded?.role || 'TECNICO',
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isTecnico: user?.role === 'TECNICO',
    isCliente: user?.role === 'CLIENTE',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
