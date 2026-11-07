import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  AlertTriangle,
  Search,
  Handshake,
  Radio,
  Shield,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Rol } from '../../types';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/encargos', icon: AlertTriangle, label: 'Encargos' },
  { to: '/hallazgos', icon: FileSearch, label: 'Hallazgos' },
  { to: '/reunificaciones', icon: Handshake, label: 'Reunificaciones' },
  { to: '/consulta', icon: Search, label: 'Consulta Placa' },
  { to: '/lecturas', icon: Radio, label: 'Lecturas Pórtico' },
];

const rolLabels: Record<Rol, string> = {
  [Rol.ADMIN]: 'Administrador',
  [Rol.SUPERVISOR]: 'Supervisor',
  [Rol.FUNCIONARIO]: 'Funcionario',
  [Rol.GUARDIA]: 'Guardia',
};

const rolColors: Record<Rol, string> = {
  [Rol.ADMIN]: 'bg-red-500',
  [Rol.SUPERVISOR]: 'bg-amber-500',
  [Rol.FUNCIONARIO]: 'bg-blue-500',
  [Rol.GUARDIA]: 'bg-green-500',
};

export function Sidebar() {
  const { usuario, cambiarRol } = useAuth();
  const [showRolMenu, setShowRolMenu] = useState(false);

  const esAdmin = usuario.rol === Rol.ADMIN;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-800 text-white flex flex-col z-30">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide">SIREPP</h1>
            <p className="text-[11px] text-white/50 leading-tight">
              Sistema de Registro y<br />Reunificación de Placas
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}

        {/* Solo visible para ADMIN */}
        {esAdmin && (
          <>
            <div className="border-t border-white/10 my-3" />
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`
              }
            >
              <Settings size={18} />
              Administración
            </NavLink>
          </>
        )}
      </nav>

      {/* User + Role Selector */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="relative">
          <button
            onClick={() => setShowRolMenu(!showRolMenu)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/8 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full ${rolColors[usuario.rol]} flex items-center justify-center text-xs font-bold text-white`}>
              {usuario.iniciales}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white/90 truncate">{usuario.nombre}</p>
              <p className="text-xs text-white/40">{rolLabels[usuario.rol]}</p>
            </div>
            <ChevronDown size={14} className={`text-white/40 transition-transform ${showRolMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showRolMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-700 rounded-lg border border-white/10 shadow-xl overflow-hidden">
              <p className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 font-semibold">
                Cambiar rol (demo)
              </p>
              {Object.values(Rol).map((rol) => (
                <button
                  key={rol}
                  onClick={() => {
                    cambiarRol(rol);
                    setShowRolMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    usuario.rol === rol
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${rolColors[rol]} flex items-center justify-center`}>
                    <span className="text-[10px] font-bold text-white">
                      {rolLabels[rol][0]}
                    </span>
                  </div>
                  <span>{rolLabels[rol]}</span>
                  {usuario.rol === rol && (
                    <span className="ml-auto text-xs text-white/40">&check;</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}