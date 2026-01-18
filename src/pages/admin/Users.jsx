import { useState } from 'react';
import toast from 'react-hot-toast';

const Users = () => {
  // Por ahora datos estáticos - se puede conectar a un endpoint de usuarios si existe
  const [users] = useState([
    { id: 1, name: 'Admin', email: 'admin@techflow.com', role: 'ADMIN', status: 'active' },
    { id: 2, name: 'Técnico 1', email: 'tecnico@techflow.com', role: 'TECNICO', status: 'active' },
  ]);

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: 'bg-emerald-500/20 text-emerald-400',
      TECNICO: 'bg-sky-500/20 text-sky-400',
      CLIENTE: 'bg-purple-500/20 text-purple-400',
    };
    return styles[role] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-slate-400">Gestión de usuarios del sistema</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Usuario</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Rol</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-slate-400">Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-slate-500 text-sm mt-4 text-center">
        * Para agregar usuarios, usa el endpoint POST /auth/register desde el backend
      </p>
    </div>
  );
};

export default Users;
