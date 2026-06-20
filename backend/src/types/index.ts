export interface Usuario {
  id: number;
  trabajador_id: number;
  email: string;
  password_hash: string;
  token_recovery?: string;
  token_expira?: Date;
  activo: boolean;
  ultimo_acceso?: Date;
  creado_en: Date;
}

export interface Trabajador {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono?: string;
  email: string;
  rol: 'Administrador' | 'Secretaria' | 'Conciliador';
  sede_id: number;
  registro_civil_comercial?: string;
  activo: boolean;
  creado_en: Date;
  nombre_sede?: string;
}

export interface Sede {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  activo: boolean;
  creado_en: Date;
}

export interface Persona {
  id: number;
  tipo_persona: 'Natural' | 'Juridica';
  nombres?: string;
  apellidos?: string;
  dni?: string;
  apoderado_id?: number;
  razon_social?: string;
  ruc?: string;
  representante_id?: number;
  telefono?: string;
  email?: string;
  direccion?: string;
  distrito_id?: number;
  activo: boolean;
  creado_en: Date;
}

export interface Expediente {
  id: number;
  numero_expediente: string;
  materia_id: number;
  sede_id: number;
  conciliador_id?: number;
  secretaria_id: number;
  motivo?: string;
  pretensiones?: string;
  estado: string;
  fecha_creacion: Date;
  fecha_vencimiento: Date;
  fecha_cierre?: Date;
  pre_aviso_generado: boolean;
  activo: boolean;
}

export interface Audiencia {
  id: number;
  expediente_id: number;
  fecha: Date;
  modalidad: 'Presencial' | 'Virtual';
  resultado?: string;
  observaciones?: string;
  estado: 'PROGRAMADA' | 'REALIZADA' | 'SUSPENDIDA';
  creado_en: Date;
}

export interface JwtPayload {
  usuarioId: number;
  trabajadorId: number;
  email: string;
  rol: string;
  sedeId: number;
}

export interface DashboardIndicadores {
  total_expedientes: number;
  en_proceso: number;
  pendientes: number;
  audiencia_programada: number;
  conciliados: number;
  no_conciliados: number;
  cerrados: number;
  vencidos: number;
}
