import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TecnicoLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { 
      to: '/tecnico/dashboard', 
      label: 'Tablero Kanban',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      )
    },
    { 
      to: '/tecnico/new-order', 
      label: 'Nueva Orden',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-800 text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="TechFlow" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg">TechFlow</span>
              <span className="bg-sky-500 text-xs px-2 py-0.5 rounded-full font-medium">Técnico</span>
            </div>
          </div>
          
          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                <span className="text-sky-400 font-medium text-sm">{user?.name?.charAt(0) || 'T'}</span>
              </div>
              <span className="text-sm text-slate-300">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
              title="Cerrar sesión"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-xl lg:hidden">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="TechFlow" className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg text-slate-800">TechFlow</span>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-sky-500 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </>
      )}
      
      {/* Main content */}
      <main className="p-4 lg:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default TecnicoLayout;
