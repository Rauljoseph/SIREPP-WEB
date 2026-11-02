import axios from 'axios';
import type {
  Encargo,
  Hallazgo,
  Reunificacion,
  EstadoPlaca,
  EventoLectura,
  CrearEncargoDto,
  CrearHallazgoDto,
  CerrarCasoDto,
  LecturaPorticoDto,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Encargos ───────────────────────────────────────────
export const encargosApi = {
  crear: (data: CrearEncargoDto) =>
    api.post<{ encargo: Encargo }>('/encargos', data).then((r) => r.data.encargo),

  obtenerPorId: (id: string) =>
    api.get<Encargo>(`/encargos/${id}`).then((r) => r.data),

  buscarPorPlaca: (placa: string) =>
    api.get<Encargo[]>(`/encargos/placa/${placa}`).then((r) => r.data),

  anular: (id: string, motivo: string) =>
    api.patch<Encargo>(`/encargos/${id}/anular`, { motivo }).then((r) => r.data),
};

// ── Hallazgos ──────────────────────────────────────────
export const hallazgosApi = {
  crear: (data: CrearHallazgoDto) =>
    api.post<{ hallazgo: Hallazgo }>('/hallazgos', data).then((r) => r.data.hallazgo),

  obtenerPorId: (id: string) =>
    api.get<Hallazgo>(`/hallazgos/${id}`).then((r) => r.data),

  buscarPorPlaca: (placa: string) =>
    api.get<Hallazgo[]>(`/hallazgos/placa/${placa}`).then((r) => r.data),
};

// ── Reunificaciones ────────────────────────────────────
export const reunificacionesApi = {
  cerrarCaso: (id: string, data: CerrarCasoDto) =>
    api.post<Reunificacion>(`/reunificaciones/${id}/entregar`, data).then((r) => r.data),
};

// ── Consulta ───────────────────────────────────────────
export const consultaApi = {
  estadoPlaca: (placa: string) =>
    api.get<EstadoPlaca>(`/consulta/placa/${placa}`).then((r) => r.data),
};

// ── Trazabilidad ───────────────────────────────────────
export const lecturaApi = {
  registrar: (data: LecturaPorticoDto) =>
    api.post<EventoLectura>('/lecturas', data).then((r) => r.data),
};

// ── Dashboard ──────────────────────────────────────────
export interface DashboardStats {
  encargosVigentes: number;
  hallazgosTotales: number;
  reunificacionesPendientes: number;
  reunificacionesEntregadas: number;
  lecturasSemana: number;
}

export const dashboardApi = {
  getStats: () =>
    api.get<DashboardStats>('/dashboard/stats').then((r) => r.data),

  getEncargosRecientes: () =>
    api.get<Encargo[]>('/dashboard/encargos-recientes').then((r) => r.data),

  getReunificacionesRecientes: () =>
    api.get<Reunificacion[]>('/dashboard/reunificaciones-recientes').then((r) => r.data),
};

export default api;
