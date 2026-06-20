import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const registerSchema = z.object({
  nombres: z.string().min(1, 'Nombres requeridos').max(100),
  apellidos: z.string().min(1, 'Apellidos requeridos').max(100),
  dni: z.string().regex(/^\d{8}$/, 'DNI debe tener 8 dígitos'),
  telefono: z.string().max(20).optional().default(''),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rol: z.enum(['Administrador', 'Conciliador', 'Secretaria']),
  sedeId: z.coerce.number().positive('Sede requerida'),
  registroCivilComercial: z.string().optional().default(''),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const sedeSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100),
  direccion: z.string().optional().default(''),
  telefono: z.string().optional().default(''),
});

export const trabajadorSchema = z.object({
  nombres: z.string().min(1, 'Nombres requeridos').max(100),
  apellidos: z.string().min(1, 'Apellidos requeridos').max(100),
  dni: z.string().regex(/^\d{8}$/, 'DNI debe tener 8 dígitos'),
  telefono: z.string().max(20).optional().default(''),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rol: z.enum(['Administrador', 'Conciliador', 'Secretaria']),
  sedeId: z.coerce.number().positive('Sede requerida'),
  registroCivilComercial: z.string().optional().default(''),
});

export const trabajadorUpdateSchema = z.object({
  nombres: z.string().min(1).max(100),
  apellidos: z.string().min(1).max(100),
  telefono: z.string().optional().default(''),
  rol: z.enum(['Administrador', 'Conciliador', 'Secretaria']),
  sedeId: z.coerce.number().positive(),
  registroCivilComercial: z.string().optional().default(''),
});

export const personaNaturalSchema = z.object({
  nombres: z.string().min(1, 'Nombres requeridos').max(100),
  apellidos: z.string().min(1, 'Apellidos requeridos').max(100),
  dni: z.string().regex(/^\d{8}$/, 'DNI debe tener 8 dígitos'),
  telefono: z.string().optional().default(''),
  email: z.string().email().optional().default(''),
  direccion: z.string().optional().default(''),
  distritoId: z.coerce.number().optional(),
  apoderadoId: z.coerce.number().optional(),
});

export const personaJuridicaSchema = z.object({
  razonSocial: z.string().min(1, 'Razón social requerida').max(200),
  ruc: z.string().regex(/^\d{11}$/, 'RUC debe tener 11 dígitos'),
  telefono: z.string().optional().default(''),
  email: z.string().email().optional().default(''),
  direccion: z.string().optional().default(''),
  distritoId: z.coerce.number().optional(),
  representanteId: z.coerce.number().optional(),
});

export const personaUpdateSchema = z.object({
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  direccion: z.string().optional(),
  distritoId: z.coerce.number().optional(),
  apoderadoId: z.coerce.number().optional(),
  representanteId: z.coerce.number().optional(),
});

export const apoderadoSchema = z.object({
  nombres: z.string().min(1, 'Nombres requeridos').max(100),
  apellidos: z.string().min(1, 'Apellidos requeridos').max(100),
  dni: z.string().regex(/^\d{8}$/, 'DNI debe tener 8 dígitos'),
  telefono: z.string().optional().default(''),
  email: z.string().email().optional().default(''),
});

export const representanteSchema = z.object({
  nombres: z.string().min(1, 'Nombres requeridos').max(100),
  apellidos: z.string().min(1, 'Apellidos requeridos').max(100),
  dni: z.string().regex(/^\d{8}$/, 'DNI debe tener 8 dígitos'),
  cargo: z.string().optional().default(''),
  telefono: z.string().optional().default(''),
  email: z.string().email().optional().default(''),
});

export const materiaSchema = z.object({
  tipoMateriaId: z.coerce.number().positive('Tipo de materia requerido'),
  nombre: z.string().min(1, 'Nombre requerido').max(100),
});

export const materiaUpdateSchema = z.object({
  tipoMateriaId: z.coerce.number().optional(),
  nombre: z.string().min(1).max(100).optional(),
});

export const requisitoSchema = z.object({
  materiaId: z.coerce.number().positive(),
  nombreDoc: z.string().min(1, 'Nombre del documento requerido').max(200),
  obligatorio: z.coerce.boolean(),
});

export const expedienteSchema = z.object({
  materiaId: z.coerce.number().positive('Materia requerida'),
  sedeId: z.coerce.number().positive('Sede requerida'),
  secretariaId: z.coerce.number().positive('Secretaria requerida'),
  motivo: z.string().optional().default(''),
  pretensiones: z.string().optional().default(''),
});

export const expedienteEstadoSchema = z.object({
  estado: z.enum(['REGISTRADO', 'EN PROCESO', 'AUDIENCIA PROGRAMADA', 'CONCILIADO', 'NO CONCILIADO', 'CERRADO', 'VENCIDO']),
});

export const asignarConciliadorSchema = z.object({
  conciliadorId: z.coerce.number().positive('Conciliador requerido'),
});

export const parteSchema = z.object({
  personaId: z.coerce.number().positive('Persona requerida'),
  tipoParte: z.enum(['Solicitante', 'Invitado']),
});

export const mesaPartesSchema = z.object({
  requisitoId: z.coerce.number().positive(),
  presentado: z.coerce.boolean(),
});

export const audienciaSchema = z.object({
  expedienteId: z.coerce.number().positive(),
  fecha: z.string().min(1, 'Fecha requerida'),
  modalidad: z.enum(['Presencial', 'Virtual']),
});

export const audienciaResultadoSchema = z.object({
  expedienteId: z.coerce.number().positive(),
  resultado: z.string().min(1, 'Resultado requerido'),
  observaciones: z.string().optional().default(''),
});

export const documentoGenerarSchema = z.object({
  expedienteId: z.coerce.number().positive(),
  tipoDocumento: z.enum([
    'Acta de Conciliacion', 'Esquela de Designacion',
    'Invitacion a Conciliar', 'Pre Aviso', 'Constancia de Asistencia',
  ]),
});

export const chatbotAskSchema = z.object({
  question: z.string().min(1, 'Pregunta requerida'),
});
