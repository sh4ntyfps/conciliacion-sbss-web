import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Users, Building2, Briefcase,
  FileText, BarChart3, CalendarDays, UserCircle, Settings,
  LogOut, ChevronLeft, ChevronRight, Sun, Moon
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Secretaria', 'Conciliador'] },
  { path: '/expedientes', label: 'Expedientes', icon: FolderOpen, roles: ['Administrador', 'Secretaria', 'Conciliador'] },
  { path: '/audiencias', label: 'Audiencias', icon: CalendarDays, roles: ['Administrador', 'Conciliador'] },
  { path: '/personas', label: 'Personas', icon: Users, roles: ['Administrador', 'Secretaria'] },
  { path: '/trabajadores', label: 'Trabajadores', icon: Briefcase, roles: ['Administrador'] },
  { path: '/sedes', label: 'Sedes', icon: Building2, roles: ['Administrador'] },
  { path: '/materias', label: 'Materias', icon: FileText, roles: ['Administrador'] },
  { path: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['Administrador'] },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { usuario, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">SBSS</h2>}
        <button onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer border-none text-slate-400">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
        {menuItems
          .filter(item => item.roles.includes(usuario?.rol || ''))
          .map(item => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }>
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        {/* Theme toggle */}
        <button onClick={toggle}
          className="logout-btn mb-1"
          style={{ color: dark ? '#f59e0b' : '#94a3b8' }}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{dark ? 'Modo Claro' : 'Modo Oscuro'}</span>}
        </button>

        {/* Perfil */}
        <NavLink to="/perfil" className="flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 no-underline text-sm">
          <Settings size={18} />
          {!collapsed && <span>Mi Perfil</span>}
        </NavLink>

        {/* User info */}
        <div className="flex items-center gap-2.5 text-slate-400 my-2 px-3 py-2 rounded-md bg-white/5">
          <UserCircle size={20} />
          {!collapsed && (
            <div className="truncate">
              <p className="text-xs text-white font-semibold truncate">{usuario?.nombres} {usuario?.apellidos}</p>
              <p className="text-[11px] text-blue-400">{usuario?.rol}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          {!collapsed && <span>Salir</span>}
        </button>
      </div>
    </aside>
  );
}
