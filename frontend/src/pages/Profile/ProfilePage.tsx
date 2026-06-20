import { useState } from 'react';
import { authApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

export default function ProfilePage() {
  const { usuario } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMsg('Las contraseñas no coinciden');
    }
    try {
      await authApi.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setMsg('Contraseña actualizada exitosamente');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setMsg('Error: contraseña actual incorrecta');
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">Mi Perfil</h1>
      <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 16 }}>
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800"><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre</label><span className="text-sm text-slate-700 dark:text-slate-300 text-right">{usuario?.nombres} {usuario?.apellidos}</span></div>
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800"><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</label><span className="text-sm text-slate-700 dark:text-slate-300 text-right">{usuario?.email}</span></div>
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800"><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rol</label><span className="text-sm text-slate-700 dark:text-slate-300 text-right">{usuario?.rol}</span></div>
        <div className="flex items-center justify-between py-2.5"><label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sede</label><span className="text-sm text-slate-700 dark:text-slate-300 text-right">{usuario?.nombreSede}</span></div>
      </div>

      <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 16 }}>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Cambiar Contraseña</h2>
        {msg && <div className={`px-4 py-3 rounded-lg text-sm mb-4 ${msg.includes('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'}`}>{msg}</div>}
        <form onSubmit={changePassword}>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Contraseña Actual</label><input type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
            <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nueva Contraseña</label><input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
            <div className="mb-4" style={{ gridColumn: '1 / -1' }}><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Confirmar Contraseña</label><input type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
          </div>
          <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none" style={{ marginTop: 12 }}><Lock size={18} /> Actualizar Contraseña</button>
        </form>
      </div>
    </div>
  );
}
