import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi, eventosApi } from '../services/api';

type TabType = 'audit' | 'eventos';

/* ─── Tipos ─────────────────────────────────────── */
interface AuditLog {
  id: number;
  usuarioId: string;
  accion: string;
  entidad: string;
  entidadId: string | null;
  detalle: Record<string, any> | null;
  ip: string;
  userAgent: string | null;
  createdAt: string;
  usuario: {
    nombreCompleto: string;
    email: string;
    rol: string;
  };
}

interface EventoDominio {
  id: number;
  tipo: string;
  payload: Record<string, any>;
  procesado: boolean;
  createdAt: string;
}

/* ─── Colores por acción ────────────────────────── */
const accionStyle: Record<string, string> = {
  CREAR: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  ACTUALIZAR: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  ELIMINAR: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  BORRAR: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  CONSULTAR: 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20',
};

const tipoEventoStyle: Record<string, string> = {
  PLACA_ENCARGADA: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  PLACA_HALLADA: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  PLACA_REUNIFICADA: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  PLACA_LEIDA: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20',
  CASO_CERRADO: 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20',
  ENCARGO_ANULADO: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  ENCARGO_EXPIRADO: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20',
};

/* ─── Formatear fecha ───────────────────────────── */
function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/* ─── Formatear detalle legible ─────────────────── */
function formatDetalle(detalle: Record<string, any> | null): string {
  if (!detalle) return '—';
  try {
    const keys = Object.keys(detalle);
    if (keys.length === 0) return '—';
    return keys
      .map((k) => {
        const val = detalle[k];
        if (typeof val === 'object' && val !== null) return `${k}: ${JSON.stringify(val)}`;
        return `${k}: ${val}`;
      })
      .join(' | ');
  } catch {
    return JSON.stringify(detalle);
  }
}

/* ─── Componente principal ──────────────────────── */
export default function AuditoriaPage() {
  const [tab, setTab] = useState<TabType>('audit');
  const [filtroEntidad, setFiltroEntidad] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroTipoEvento, setFiltroTipoEvento] = useState('');

  const auditQuery = useQuery({
    queryKey: ['audit-logs', filtroEntidad, filtroAccion],
    queryFn: () =>
      auditApi.listar({
        entidad: filtroEntidad || undefined,
        accion: filtroAccion || undefined,
      }),
    enabled: tab === 'audit',
  });

  const eventosQuery = useQuery({
    queryKey: ['eventos-dominio', filtroTipoEvento],
    queryFn: () =>
      eventosApi.listar({ tipo: filtroTipoEvento || undefined }),
    enabled: tab === 'eventos',
  });

  const auditLogs: AuditLog[] = auditQuery.data?.registros ?? [];
  const eventos: EventoDominio[] = eventosQuery.data?.eventos ?? [];

  const totalAudit = auditQuery.data?.total ?? 0;
  const totalEventos = eventosQuery.data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auditoría y Eventos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registro de actividad del sistema y eventos de dominio
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTab('audit')}
            className={`whitespace-nowrap border-b-2 pb-3 px-1 text-sm font-medium transition-colors ${
              tab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Registro de Auditoría
            {totalAudit > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 text-blue-600 px-2 py-0.5 text-xs font-semibold">
                {totalAudit}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('eventos')}
            className={`whitespace-nowrap border-b-2 pb-3 px-1 text-sm font-medium transition-colors ${
              tab === 'eventos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Eventos de Dominio
            {totalEventos > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 text-blue-600 px-2 py-0.5 text-xs font-semibold">
                {totalEventos}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* ═══ TAB: AUDITORÍA ═══════════════════════ */}
      {tab === 'audit' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-3">
            <select
              value={filtroEntidad}
              onChange={(e) => setFiltroEntidad(e.target.value)}
              className="block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas las entidades</option>
              <option value="ENCARGO">Encargo</option>
              <option value="HALLAZGO">Hallazgo</option>
              <option value="REUNIFICACION">Reunificación</option>
              <option value="USUARIO">Usuario</option>
              <option value="UNIDAD">Unidad</option>
            </select>
            <select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              className="block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas las acciones</option>
              <option value="CREAR">Crear</option>
              <option value="ACTUALIZAR">Actualizar</option>
              <option value="ELIMINAR">Eliminar</option>
              <option value="BORRAR">Borrar</option>
              <option value="CONSULTAR">Consultar</option>
            </select>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Acción
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Entidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  IP
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Detalle
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {auditQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    Cargando registros...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    No hay registros de auditoría
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {formatFecha(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {log.usuario.nombreCompleto}
                      </div>
                      <div className="text-xs text-gray-400">{log.usuario.rol}</div>
                    </td>
                    <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                            accionStyle[log.accion] ?? 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20'
                          }`}
                        >
                          {log.accion}
                        </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{log.entidad}</div>
                      {log.entidadId && (
                        <div className="text-xs text-gray-400 font-mono truncate max-w-[140px]">
                          {log.entidadId}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400 font-mono">
                      {log.ip}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[250px] truncate" title={formatDetalle(log.detalle)}>
                      {formatDetalle(log.detalle)}
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB: EVENTOS DE DOMINIO ══════════════ */}
      {tab === 'eventos' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-3">
            <select
              value={filtroTipoEvento}
              onChange={(e) => setFiltroTipoEvento(e.target.value)}
              className="block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="PLACA_ENCARGADA">Placa Encargada</option>
              <option value="PLACA_HALLADA">Placa Hallada</option>
              <option value="PLACA_REUNIFICADA">Placa Reunificada</option>
              <option value="PLACA_LEIDA">Placa Leída</option>
              <option value="CASO_CERRADO">Caso Cerrado</option>
              <option value="ENCARGO_ANULADO">Encargo Anulado</option>
              <option value="ENCARGO_EXPIRADO">Encargo Expirado</option>
            </select>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Payload
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {eventosQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                    Cargando eventos...
                  </td>
                </tr>
              ) : eventos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                    No hay eventos de dominio registrados
                  </td>
                </tr>
              ) : (
                eventos.map((evento) => (
                  <tr key={evento.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-400 font-mono">
                      #{evento.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {formatFecha(evento.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                            tipoEventoStyle[evento.tipo] ?? 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20'
                          }`}
                        >
                          {evento.tipo.replace(/_/g, ' ')}
                        </span>
                    </td>
                    <td className="px-4 py-3">
                      {evento.procesado ? (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                            Procesado
                          </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">
                            Pendiente
                          </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[350px]">
                        <pre className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-md p-2 overflow-auto max-h-20 whitespace-pre-wrap">
                          {JSON.stringify(evento.payload, null, 2)}
                        </pre>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}