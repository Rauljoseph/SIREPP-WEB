// ── Enums ──────────────────────────────────────────────
export enum TipoEvento {
  ROBO = 'ROBO',
  HURTO = 'HURTO',
  EXTRAVIO = 'EXTRAVIO',
}

export enum EstadoEncargo {
  VIGENTE = 'VIGENTE',
  REUNIFICADO = 'REUNIFICADO',
  ANULADO = 'ANULADO',
  CERRADO = 'CERRADO',
}

export enum EstadoFisico {
  BUENO = 'BUENO',
  REGULAR = 'REGULAR',
  MALO = 'MALO',
  DESARMADO = 'DESARMADO',
}

export enum EstadoReunificacion {
  PENDIENTE = 'PENDIENTE',
  ENTREGADO = 'ENTREGADO',
}

export enum TipoNotificacion {
  REUNIFICACION = 'REUNIFICACION',
  LECTURA_PORTICO = 'LECTURA_PORTICO',
}

export enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',
  ENVIADA = 'ENVIADA',
  FALLIDA = 'FALLIDA',
}

export enum Rol {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  FUNCIONARIO = 'FUNCIONARIO',
  GUARDIA = 'GUARDIA',
}

// ── Entidades ──────────────────────────────────────────
export interface Unidad {
  id: string;
  nombre: string;
  direccion: string;
  horarioAtencion?: string;
  createdAt: string;
}

export interface Encargo {
  id: string;
  placa: string;
  tipoEvento: TipoEvento;
  estado: EstadoEncargo;
  denuncianteRut: string;
  denuncianteNombre: string;
  denuncianteEmail: string;
  denuncianteTelefono?: string;
  lugarHecho?: string;
  fechaHecho: string;
  observaciones?: string;
  unidadId: string;
  unidad?: Unidad;
  funcionarioId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hallazgo {
  id: string;
  placa: string;
  estadoFisico: EstadoFisico;
  ubicacion?: string;
  observaciones?: string;
  unidadId: string;
  unidad?: Unidad;
  funcionarioId: string;
  createdAt: string;
}

export interface Reunificacion {
  id: string;
  encargoId: string;
  hallazgoId: string;
  estado: EstadoReunificacion;
  receptorRut?: string;
  receptorNombre?: string;
  fechaEntrega?: string;
  encargo?: Encargo;
  hallazgo?: Hallazgo;
  createdAt: string;
}

export interface EventoLectura {
  id: string;
  placa: string;
  portico: string;
  nivelConfianza: number;
  timestampLectura: string;
  notificado: boolean;
  createdAt: string;
}

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  destinatario: string;
  asunto: string;
  cuerpo: string;
  estado: EstadoNotificacion;
  intentos: number;
  createdAt: string;
}

export interface EstadoPlaca {
  placa: string;
  encargos: Encargo[];
  hallazgos: Hallazgo[];
  reunificaciones: Reunificacion[];
  lecturas: EventoLectura[];
  resumen: {
    tieneEncargoVigente: boolean;
    estaReunificada: boolean;
    estaCerrada: boolean;
  };
}

// ── DTOs ───────────────────────────────────────────────
export interface CrearEncargoDto {
  placa: string;
  tipoEvento: TipoEvento;
  denuncianteRut: string;
  denuncianteNombre: string;
  denuncianteEmail: string;
  denuncianteTelefono?: string;
  lugarHecho?: string;
  fechaHecho: string;
  observaciones?: string;
  unidadId: string;
}

export interface CrearHallazgoDto {
  placa: string;
  estadoFisico: EstadoFisico;
  ubicacion?: string;
  observaciones?: string;
  unidadId: string;
}

export interface CerrarCasoDto {
  receptorRut: string;
  receptorNombre: string;
}

export interface LecturaPorticoDto {
  placa: string;
  portico: string;
  nivelConfianza: number;
  timestampLectura: string;
}

// ── Dashboard ──────────────────────────────────────────
export interface DashboardStats {
  encargosVigentes: number;
  hallazgosTotales: number;
  reunificacionesPendientes: number;
  reunificacionesEntregadas: number;
  lecturasSemana: number;
}
