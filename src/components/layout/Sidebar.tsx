import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  AlertTriangle,
  Search,
  Handshake,
  Radio,
  Shield,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/encargos', icon: AlertTriangle, label: 'Encargos' },
  { to: '/hallazgos', icon: FileSearch, label: 'Hallazgos' },
  { to: '/reunificaciones', icon: Handshake, label: 'Reunificaciones' },
  { to: '/consulta', icon: Search, label: 'Consulta Placa' },
  { to: '/lecturas', icon: Radio, label: 'Lecturas Pórtico' },
];

export function Sidebar() {
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
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-semibold">
            OP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">Operador</p>
            <p className="text-xs text-white/40">Funcionario</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
