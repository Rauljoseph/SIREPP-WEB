import { useState, useEffect, useRef } from 'react';
import { Bell, RefreshCw, Mail, AlertCircle } from 'lucide-react';
import { notificacionesApi, type NotificacionFallida } from '../../services/api';

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Header({ title, description, action }: HeaderProps) {
  const [fallidas, setFallidas] = useState<NotificacionFallida[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [reintentando, setReintentando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cargarFallidas = async () => {
    try {
      const data = await notificacionesApi.fallidas();
      setFallidas(data.notificaciones);
    } catch {
      // silenciar error si el endpoint no existe aún
    }
  };

  useEffect(() => {
    cargarFallidas();
    const interval = setInterval(cargarFallidas, 60000); // cada 60s
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleReintentar = async () => {
    setReintentando(true);
    setMensaje('');
    try {
      const resultado = await notificacionesApi.reintentar();
      setMensaje(`${resultado.exitosas} enviadas, ${resultado.fallidas} fallidas`);
      await cargarFallidas();
    } catch {
      setMensaje('Error al reintentar');
    } finally {
      setReintentando(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {action}
          {/* Campanita de notificaciones */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} />
              {fallidas.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
                  {fallidas.length}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Correos fallidos</h3>
                  {fallidas.length > 0 && (
                    <button
                      onClick={handleReintentar}
                      disabled={reintentando}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={reintentando ? 'animate-spin' : ''} />
                      Reintentar todos
                    </button>
                  )}
                </div>

                {mensaje && (
                  <div className="px-4 py-2 bg-blue-50 text-xs text-blue-700 border-b border-gray-100">
                    {mensaje}
                  </div>
                )}

                <div className="max-h-72 overflow-y-auto">
                  {fallidas.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Mail size={24} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">Sin correos fallidos</p>
                    </div>
                  ) : (
                    fallidas.map((n) => (
                      <div key={n.id} className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800 truncate">{n.destinatarioEmail}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Intento {n.intentos}/3 · {n.ultimoIntentoAt ? formatDate(n.ultimoIntentoAt) : formatDate(n.createdAt)}
                            </p>
                            {n.resultado && (
                              <p className="text-xs text-red-500 mt-0.5 truncate">{n.resultado}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}