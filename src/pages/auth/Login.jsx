import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Completa todos los campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await login(email, password);
      
      console.log('✅ Usuario logueado:', user);
      console.log('🔑 Rol detectado:', user.role);

      const redirectPath = {
        ADMIN: '/admin/dashboard',
        TECNICO: '/tecnico/dashboard',
        CLIENTE: '/cliente/dashboard',
        ROLE_ADMIN: '/admin/dashboard',
        ROLE_TECNICO: '/tecnico/dashboard',
        ROLE_CLIENTE: '/cliente/dashboard',
        admin: '/admin/dashboard',
        tecnico: '/tecnico/dashboard',
        cliente: '/cliente/dashboard',
      };

      const targetPath = redirectPath[user.role];

      if (targetPath) {
        toast.success(`¡Bienvenido, ${user.name}!`);
        navigate(targetPath, { replace: true });
      } else {
        console.error('❌ Error: El rol no tiene ruta definida:', user.role);
        toast.error(`Error: Rol desconocido (${user.role})`);
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      if (!toast.d) toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="TechFlow" className="w-16 h-16 object-contain" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">TechFlow</h1>
            <p className="text-slate-500 mt-1">Sistema de Gestión de Taller</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="usuario@techflow.com"
                  autoComplete="email"
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <Link to="/tracking" className="text-sky-500 hover:text-sky-600 text-sm font-medium block">
              ¿Eres cliente? Consulta tu estado aquí
            </Link>
            <div className="border-t border-slate-200 pt-4">
              <Link to="/register" className="text-slate-500 hover:text-slate-700 text-sm">
                ¿No tienes cuenta? <span className="text-sky-500 font-medium">Regístrate</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-6">
          © 2024 TechFlow. Sistema de gestión de taller técnico.
        </p>
      </div>
    </div>
  );
};

export default Login;
