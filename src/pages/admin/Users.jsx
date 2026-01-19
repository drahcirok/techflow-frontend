import { useState } from 'react';

const Users = () => {
  const [users] = useState([
    { id: 1, name: 'Admin', email: 'admin@techflow.com', role: 'ADMIN', status: 'active' },
    { id: 2, name: 'Técnico 1', email: 'tecnico@techflow.com', role: 'TECNICO', status: 'active' },
  ]);

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: 'bg-green-100 text-green-600',
      TECNICO: 'bg-blue-100 text-blue-600',
      CLIENTE: 'bg-purple-100 text-purple-600',
    };
    return styles[role] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-slate-500">Gestión de usuarios del sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Usuario</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Rol</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-slate-600">Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-slate-600 font-medium">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium">{user.name}</p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-slate-400 text-sm mt-4 text-center">
        Para agregar usuarios, usa POST /auth/register desde el backend
      </p>
    </div>
  );
};

export default Users;
