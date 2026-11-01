import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  FileSearch,
  Handshake,
  CheckCircle,
  Radio,
  TrendingUp,
  Clock,
  ArrowRight,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { type Encargo, type Reunificacion } from '../types';
import { dashboardApi, type DashboardStats } from '../services/api';

const estadoBadge: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; label: string }> = {
  VIGENTE: { variant: 'warning', label: 'Vigente' },
  REUNIFICADO: { variant: 'success', label: 'Reunificado' },
  ANULADO: { variant: 'neutral', label: 'Anulado' },
  CERRADO: { variant: 'info', label: 'Cerrado' },
  PENDIENTE: { variant: 'warning', label: 'Pendiente' },
  ENTREGADO: { variant: 'success', label: 'Entregado' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [encargosRecientes, setEncargosRecientes] = useState<Encargo[]>([]);
  const [reunificacionesRecientes, setReunificacionesRecientes] = useState<Reunificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [statsData, encargos, reunificaciones] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getEncargosRecientes(),
        dashboardApi.getReunificacionesRecientes(),
      ]);
      setStats(statsData);
      setEncargosRecientes(encargos);
      setReunificacionesRecientes(reunificaciones);
      setApiConnected(true);
    } catch {
      setApiConnected(false);
      // Fallback: datos vacíos
      setStats({
        encargosVigentes: 0,
        hallazgosTotales: 0,
        reunificacionesPendientes: 0,
        reunificacionesEntregadas: 0,
        lecturasSemana: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" description="Vista general del sistema SIREPP" />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-blue-700" />
          <span className="ml-3 text-gray-500">Conectando con el servidor...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" description="Vista general del sistema SIREPP" />

      <div className="p-8 space-y-8">
        {/* API disconnected warning */}
        {!apiConnected && (
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
            <WifiOff size={18} className="text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                No se pudo conectar con el backend
              </p>
              <p className="text-xs text-yellow-600 mt-0.5">
                Asegúrate de que el servidor esté corriendo en <code className="bg-yellow-100 px-1 rounded">localhost:3000</code>.
                Ejecuta <code className="bg-yellow-100 px-1 rounded">cd sirepp-api && pnpm start:dev</code>
              </p>
            </div>
            <button
              onClick={loadDashboard}
              className="ml-auto text-sm font-medium text-yellow-700 hover:text-yellow-900 px-3 py-1 rounded hover:bg-yellow-100"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Encargos Vigentes" value={stats.encargosVigentes} icon={AlertTriangle} variant="warning" />
            <StatCard title="Hallazgos" value={stats.hallazgosTotales} icon={FileSearch} variant="default" />
            <StatCard title="Reunif. Pendientes" value={stats.reunificacionesPendientes} icon={Handshake} variant="danger" />
            <StatCard title="Reunif. Entregadas" value={stats.reunificacionesEntregadas} icon={CheckCircle} variant="success" />
            <StatCard title="Lecturas (7d)" value={stats.lecturasSemana} icon={Radio} variant="default" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimos encargos */}
          <Card padding={false}>
            <div className="p-6 pb-0">
              <CardHeader
                title="Últimos Encargos"
                action={
                  <button
                    onClick={() => navigate('/encargos')}
                    className="text-sm text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                  >
                    Ver todos <ArrowRight size={14} />
                  </button>
                }
              />
            </div>
            {encargosRecientes.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-gray-400 text-center py-8">
                {apiConnected ? 'Sin encargos registrados aún' : 'Conecta el backend para ver datos'}
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {encargosRecientes.map((enc) => {
                  const badge = estadoBadge[enc.estado] || { variant: 'neutral' as const, label: enc.estado };
                  return (
                    <div key={enc.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/encargos')}
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                          {enc.placa}
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">{enc.denuncianteNombre}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} /> {formatDate(enc.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Reunificaciones recientes */}
          <Card padding={false}>
            <div className="p-6 pb-0">
              <CardHeader
                title="Reunificaciones Recientes"
                action={
                  <button
                    onClick={() => navigate('/reunificaciones')}
                    className="text-sm text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                  >
                    Ver todas <ArrowRight size={14} />
                  </button>
                }
              />
            </div>
            {reunificacionesRecientes.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-gray-400 text-center py-8">
                {apiConnected ? 'Sin reunificaciones registradas' : 'Conecta el backend para ver datos'}
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {reunificacionesRecientes.map((reu) => {
                  const badge = estadoBadge[reu.estado] || { variant: 'neutral' as const, label: reu.estado };
                  return (
                    <div key={reu.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm text-gray-700">
                          {reu.encargo?.placa
                            ? <span className="font-mono font-bold bg-gray-100 px-2 py-0.5 rounded mr-2">{reu.encargo.placa}</span>
                            : null
                          }
                          Reunificación
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} /> {formatDate(reu.createdAt)}
                        </p>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Status */}
        <Card>
          <div className="flex items-center gap-3 text-gray-500">
            <TrendingUp size={18} />
            <p className="text-sm">
              {apiConnected
                ? 'Sistema operando con normalidad. Datos sincronizados con el backend.'
                : 'Sistema en modo desconectado. Los módulos de registro funcionan al reconectar.'
              }
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
