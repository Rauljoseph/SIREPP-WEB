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
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
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

  anular: (id: string, motivo: string, supervisorId: string) =>
    api.patch<Encargo>(`/encargos/${id}/anular`, { motivo, supervisorId }).then((r) => r.data),
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
export interface RespuestaLectura extends EventoLectura {
  registrada: boolean;
  notificada: boolean;
  motivo: string | null;
}

export const lecturaApi = {
  registrar: (data: LecturaPorticoDto) =>
    api.post<RespuestaLectura>('/lecturas', data).then((r) => r.data),
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

// ── Notificaciones ─────────────────────────────────────
export interface NotificacionFallida {
  id: string;
  destinatarioEmail: string;
  tipo: string;
  estado: string;
  intentos: number;
  resultado: string | null;
  ultimoIntentoAt: string | null;
  reunificacionId: string | null;
  createdAt: string;
}

export const notificacionesApi = {
  fallidas: () =>
    api.get<{ total: number; notificaciones: NotificacionFallida[] }>('/notificaciones/fallidas').then((r) => r.data),

  reintentar: () =>
    api.post<{ exitosas: number; fallidas: number }>('/notificaciones/reintentar').then((r) => r.data),
};

// ── Administración ────────────────────────────────────
export interface UnidadAdmin {
  id: string;
  nombre: string;
  tipo: string;
  direccion: string;
  region: string;
  comuna: string;
  horarioAtencion: string | null;
  telefono: string | null;
  activa: boolean;
  createdAt: string;
  _count?: { usuarios: number };
}

export interface UsuarioAdmin {
  id: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  unidadId: string;
  servicioActivo: boolean;
  createdAt: string;
  unidad?: { id: string; nombre: string };
}

export interface CrearUnidadAdminDto {
  nombre: string;
  tipo: string;
  direccion: string;
  region: string;
  comuna: string;
  horarioAtencion?: string;
  telefono?: string;
}

export interface CrearUsuarioAdminDto {
  nombreCompleto: string;
  email: string;
  rol: string;
  unidadId: string;
}

export const adminApi = {
  // Unidades
  listarUnidades: () =>
    api.get<UnidadAdmin[]>('/admin/unidades').then((r) => r.data),

  crearUnidad: (data: CrearUnidadAdminDto) =>
    api.post<UnidadAdmin>('/admin/unidades', data).then((r) => r.data),

  eliminarUnidad: (id: string) =>
    api.delete(`/admin/unidades/${id}`).then((r) => r.data),

  // Usuarios
  listarUsuarios: () =>
    api.get<UsuarioAdmin[]>('/admin/usuarios').then((r) => r.data),

  crearUsuario: (data: CrearUsuarioAdminDto) =>
    api.post<UsuarioAdmin>('/admin/usuarios', data).then((r) => r.data),

  eliminarUsuario: (id: string) =>
    api.delete(`/admin/usuarios/${id}`).then((r) => r.data),
};

// ─── AUDITORÍA ──────────────────────────────────
export const auditApi = {
  listar: async (params?: { entidad?: string; accion?: string; desde?: string; hasta?: string }) => {
    const query = new URLSearchParams();
    if (params?.entidad) query.set('entidad', params.entidad);
    if (params?.accion) query.set('accion', params.accion);
    if (params?.desde) query.set('desde', params.desde);
    if (params?.hasta) query.set('hasta', params.hasta);
    const res = await api.get(`/audit?${query.toString()}`);
    return res.data;
  },
  resumen: async () => {
    const res = await api.get('/audit/resumen');
    return res.data;
  },
};

// ─── EVENTOS DE DOMINIO ─────────────────────────
export const eventosApi = {
  listar: async (params?: { tipo?: string; procesado?: string }) => {
    const query = new URLSearchParams();
    if (params?.tipo) query.set('tipo', params.tipo);
    if (params?.procesado) query.set('procesado', params.procesado);
    const res = await api.get(`/eventos?${query.toString()}`);
    return res.data;
  },
  resumen: async () => {
    const res = await api.get('/eventos/resumen');
    return res.data;
  },
};

export default api;