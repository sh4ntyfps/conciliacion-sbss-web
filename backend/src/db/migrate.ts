import 'dotenv/config';
import { query } from '../config/database';

async function migrate() {
  console.log('Running migration...');

  await query(`CREATE TABLE IF NOT EXISTS departamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
  )`);

  await query(`CREATE TABLE IF NOT EXISTS provincias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamento_id INTEGER NOT NULL REFERENCES departamentos(id)
  )`);

  await query(`CREATE TABLE IF NOT EXISTS distritos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    provincia_id INTEGER NOT NULL REFERENCES provincias(id)
  )`);

  await query(`CREATE TABLE IF NOT EXISTS sedes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS trabajadores (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(8) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(150) NOT NULL UNIQUE,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('Administrador','Secretaria','Conciliador')),
    sede_id INTEGER NOT NULL REFERENCES sedes(id),
    registro_civil_comercial VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    trabajador_id INTEGER NOT NULL REFERENCES trabajadores(id),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    token_recovery VARCHAR(255),
    token_expira TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS tipos_materia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true
  )`);

  await query(`CREATE TABLE IF NOT EXISTS materias (
    id SERIAL PRIMARY KEY,
    tipo_materia_id INTEGER NOT NULL REFERENCES tipos_materia(id),
    nombre VARCHAR(150) NOT NULL,
    activo BOOLEAN DEFAULT true
  )`);

  await query(`CREATE TABLE IF NOT EXISTS requisitos_materia_documento (
    id SERIAL PRIMARY KEY,
    materia_id INTEGER NOT NULL REFERENCES materias(id),
    nombre_doc VARCHAR(200) NOT NULL,
    obligatorio BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true
  )`);

  await query(`CREATE TABLE IF NOT EXISTS apoderados (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(8) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS representantes (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(8) NOT NULL,
    cargo VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(150),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS personas (
    id SERIAL PRIMARY KEY,
    tipo_persona VARCHAR(10) NOT NULL CHECK (tipo_persona IN ('Natural','Juridica')),
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    dni VARCHAR(8),
    apoderado_id INTEGER REFERENCES apoderados(id),
    razon_social VARCHAR(200),
    ruc VARCHAR(11),
    representante_id INTEGER REFERENCES representantes(id),
    telefono VARCHAR(20),
    email VARCHAR(150),
    direccion VARCHAR(255),
    distrito_id INTEGER REFERENCES distritos(id),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS expedientes (
    id SERIAL PRIMARY KEY,
    numero_expediente VARCHAR(20) NOT NULL UNIQUE,
    materia_id INTEGER NOT NULL REFERENCES materias(id),
    sede_id INTEGER NOT NULL REFERENCES sedes(id),
    conciliador_id INTEGER REFERENCES trabajadores(id),
    secretaria_id INTEGER NOT NULL REFERENCES trabajadores(id),
    motivo VARCHAR(500),
    pretensiones VARCHAR(1000),
    estado VARCHAR(30) NOT NULL DEFAULT 'REGISTRADO'
      CHECK (estado IN ('REGISTRADO','EN PROCESO','AUDIENCIA PROGRAMADA','CONCILIADO','NO CONCILIADO','CERRADO','VENCIDO')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento TIMESTAMP GENERATED ALWAYS AS (fecha_creacion + INTERVAL '10 days') STORED,
    fecha_cierre TIMESTAMP,
    pre_aviso_generado BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true
  )`);

  await query(`CREATE TABLE IF NOT EXISTS partes_expediente (
    id SERIAL PRIMARY KEY,
    expediente_id INTEGER NOT NULL REFERENCES expedientes(id),
    persona_id INTEGER NOT NULL REFERENCES personas(id),
    tipo_parte VARCHAR(15) NOT NULL CHECK (tipo_parte IN ('Solicitante','Invitado'))
  )`);

  await query(`CREATE TABLE IF NOT EXISTS documentos_mesa_partes (
    id SERIAL PRIMARY KEY,
    expediente_id INTEGER NOT NULL REFERENCES expedientes(id),
    requisito_id INTEGER NOT NULL REFERENCES requisitos_materia_documento(id),
    presentado BOOLEAN DEFAULT false,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS audiencias (
    id SERIAL PRIMARY KEY,
    expediente_id INTEGER NOT NULL REFERENCES expedientes(id),
    fecha TIMESTAMP NOT NULL,
    modalidad VARCHAR(20) NOT NULL CHECK (modalidad IN ('Presencial','Virtual')),
    resultado VARCHAR(30) CHECK (resultado IN ('Acuerdo Total','Acuerdo Parcial','Falta de Acuerdo','Inasistencia','Suspension')),
    observaciones VARCHAR(500),
    estado VARCHAR(15) DEFAULT 'PROGRAMADA' CHECK (estado IN ('PROGRAMADA','REALIZADA','SUSPENDIDA')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS documentos_generados (
    id SERIAL PRIMARY KEY,
    expediente_id INTEGER NOT NULL REFERENCES expedientes(id),
    tipo_documento VARCHAR(50) NOT NULL CHECK (tipo_documento IN (
      'Esquela de Designacion','Invitacion a Conciliar','Acta de Notificacion',
      'Pre Aviso','Acta de Conciliacion','Constancia de Asistencia',
      'Acta de Suspension','Acta de Falta de Acuerdo'
    )),
    ruta_archivo VARCHAR(500),
    generado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generado_por INTEGER REFERENCES trabajadores(id)
  )`);

  await query(`CREATE TABLE IF NOT EXISTS repositorio (
    id SERIAL PRIMARY KEY,
    expediente_id INTEGER NOT NULL REFERENCES expedientes(id),
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(20),
    ruta_archivo VARCHAR(500) NOT NULL,
    tamanio BIGINT,
    subido_por INTEGER REFERENCES trabajadores(id),
    subido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    expediente_id INTEGER NOT NULL REFERENCES expedientes(id),
    nombre_video VARCHAR(255) NOT NULL,
    ruta_video VARCHAR(500) NOT NULL,
    duracion INTEGER,
    subido_por INTEGER REFERENCES trabajadores(id),
    subido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE OR REPLACE VIEW vw_expedientes_con_alerta AS
    SELECT
      e.*,
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.fecha_creacion))::INTEGER AS dias_transcurridos,
      (10 - EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.fecha_creacion))::INTEGER) AS dias_restantes,
      CASE
        WHEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.fecha_creacion))::INTEGER >= 10 THEN 'VENCIDO'
        WHEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.fecha_creacion))::INTEGER >= 9 THEN 'CRITICO'
        WHEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.fecha_creacion))::INTEGER >= 8 THEN 'ADVERTENCIA'
        ELSE 'NORMAL'
      END AS alerta_vencimiento,
      t.nombres || ' ' || t.apellidos AS nombre_conciliador,
      s.nombre AS nombre_sede,
      m.nombre AS nombre_materia
    FROM expedientes e
    LEFT JOIN trabajadores t ON e.conciliador_id = t.id
    LEFT JOIN sedes s ON e.sede_id = s.id
    LEFT JOIN materias m ON e.materia_id = m.id
    WHERE e.activo = true
  `);

  console.log('Migration completed successfully');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
