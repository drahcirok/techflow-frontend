import { createContext, useContext, useState, useEffect } from 'react';
import { loginService } from '../services/authService'; 

const AuthContext = createContext(null);

// ✅ TU FUNCIÓN DECODIFICADORA
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

  // Función auxiliar para buscar el rol
  const extractRole = (decoded) => {
    if (!decoded) return null;
    if (decoded.role) return decoded.role;
    if (decoded.roles && decoded.roles.length > 0) return decoded.roles[0];
    if (decoded.authorities && decoded.authorities.length > 0) return decoded.authorities[0];
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      const decoded = decodeToken(token);
      
      // 🔴 CAMBIO IMPORTANTE: Quitamos la validación estricta de tiempo (exp)
      // Antes: if (decoded && decoded.exp * 1000 > Date.now())
      // Ahora: Solo verificamos que el token se pueda decodificar
      if (decoded) {
        console.log("✅ Token recuperado al recargar:", decoded);
        
        const foundRole = extractRole(decoded);
        
        const userData = {
          email: decoded.sub, 
          role: foundRole || 'TECNICO', 
          name: decoded.name || decoded.sub?.split('@')[0] || 'Usuario'
        };
        setUser(userData);
      } else {
        console.warn("⚠️ Token corrupto o inválido, cerrando sesión.");
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginService(email, password);
      const { token } = data;
      
      localStorage.setItem('token', token);
      
      const decoded = decodeToken(token);
      
      // Logs de depuración
      console.log("🕵️‍♂️ LOGIN - TOKEN PURO:", decoded);
      
      const foundRole = extractRole(decoded);
      console.log("🔑 LOGIN - ROL ENCONTRADO:", foundRole);

      const userData = {
        email: decoded.sub,
        role: foundRole, 
        name: decoded.name || email.split('@')[0]
      };
      
      setUser(userData);
      return userData;

    } catch (error) {
      throw error;
    }
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
    // Helpers de protección (Aceptan variantes con y sin prefijo ROLE_)
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN',
    isTecnico: user?.role === 'TECNICO' || user?.role === 'ROLE_TECNICO',
    isCliente: user?.role === 'CLIENTE' || user?.role === 'ROLE_CLIENTE',
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