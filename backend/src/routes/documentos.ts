import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';
import { validate } from '../validators/middleware';
import { documentoGenerarSchema } from '../validators/schemas';
import {
  generarActaConciliacion, generarEsquelaDesignacion,
  generarInvitacionConciliacion, generarPreAviso, generarConstanciaAsistencia
} from '../services/documentGenerator';

const router = Router();

router.get('/expediente/:expedienteId', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT dg.*, t.nombres || ' ' || t.apellidos AS generado_por_nombre
     FROM documentos_generados dg
     LEFT JOIN trabajadores t ON dg.generado_por = t.id
     WHERE dg.expediente_id = $1 ORDER BY dg.generado_en`,
    [req.params.expedienteId]
  );
  res.json(result.rows);
});

router.post('/generar', sessionAuth, validate(documentoGenerarSchema), async (req: Request, res: Response) => {
  const { expedienteId, tipoDocumento } = req.body;

  const expResult = await query(
    `SELECT e.*, m.nombre AS nombre_materia, tm.nombre AS nombre_tipo_materia,
            s.nombre AS nombre_sede, s.direccion AS sede_direccion, s.telefono AS sede_telefono,
            t.nombres || ' ' || t.apellidos AS nombre_conciliador,
            t.dni AS conciliador_dni, t.registro_civil_comercial AS conciliador_registro,
            t.nombres AS conciliador_nombres, t.apellidos AS conciliador_apellidos, t.sede_id AS conciliador_sede_id,
            s2.nombre AS conciliador_sede_nombre,
            sec.nombres || ' ' || sec.apellidos AS nombre_secretaria
     FROM expedientes e
     INNER JOIN materias m ON e.materia_id = m.id
     INNER JOIN tipos_materia tm ON m.tipo_materia_id = tm.id
     INNER JOIN sedes s ON e.sede_id = s.id
     LEFT JOIN trabajadores t ON e.conciliador_id = t.id
     LEFT JOIN sedes s2 ON t.sede_id = s2.id
     LEFT JOIN trabajadores sec ON e.secretaria_id = sec.id
     WHERE e.id = $1`,
    [expedienteId]
  );
  if (expResult.rows.length === 0) return res.status(404).json({ message: 'Expediente no encontrado' });

  const exp = expResult.rows[0];

  const partesResult = await query(
    `SELECT pe.tipo_parte, p.*, 
            a.nombres AS apoderado_nombres, a.apellidos AS apoderado_apellidos, a.dni AS apoderado_dni,
            r.nombres AS representante_nombres, r.apellidos AS representante_apellidos, r.dni AS representante_dni, r.cargo,
            d.nombre AS nombre_distrito, pr.nombre AS nombre_provincia, dep.nombre AS nombre_departamento
     FROM partes_expediente pe 
     INNER JOIN personas p ON pe.persona_id = p.id
     LEFT JOIN apoderados a ON p.apoderado_id = a.id
     LEFT JOIN representantes r ON p.representante_id = r.id
     LEFT JOIN distritos d ON p.distrito_id = d.id
     LEFT JOIN provincias pr ON d.provincia_id = pr.id
     LEFT JOIN departamentos dep ON pr.departamento_id = dep.id
     WHERE pe.expediente_id = $1`,
    [expedienteId]
  );

  function buildParte(row: any) {
    return {
      tipo: row.tipo_persona,
      nombres: row.nombres,
      apellidos: row.apellidos,
      dni: row.dni,
      razonSocial: row.razon_social,
      ruc: row.ruc,
      direccion: row.direccion,
      telefono: row.telefono,
      email: row.email,
      distrito: row.nombre_distrito,
      provincia: row.nombre_provincia,
      departamento: row.nombre_departamento,
      apoderado: row.apoderado_nombres ? {
        nombres: row.apoderado_nombres,
        apellidos: row.apoderado_apellidos,
        dni: row.apoderado_dni,
      } : undefined,
      representante: row.representante_nombres ? {
        nombres: row.representante_nombres,
        apellidos: row.representante_apellidos,
        dni: row.representante_dni,
        cargo: row.cargo,
      } : undefined,
    };
  }

  const solicitante = buildParte(partesResult.rows.find((p: any) => p.tipo_parte === 'Solicitante') || {});
  const invitado = buildParte(partesResult.rows.find((p: any) => p.tipo_parte === 'Invitado') || {});

  // Fetch latest audiencia for context
  const audienciaResult = await query(
    `SELECT fecha, resultado, modalidad, observaciones, estado 
     FROM audiencias WHERE expediente_id = $1 ORDER BY fecha DESC LIMIT 1`,
    [expedienteId]
  );
  const ultimaAudiencia = audienciaResult.rows[0] || null;

  const docData = {
    numeroExpediente: exp.numero_expediente,
    fecha: new Date().toLocaleDateString('es-PE'),
    sede: exp.nombre_sede,
    sedeDireccion: exp.sede_direccion || '',
    sedeTelefono: exp.sede_telefono || '',
    materia: exp.nombre_materia,
    motivo: exp.motivo || '',
    pretensiones: exp.pretensiones || '',
    solicitante,
    invitado,
    conciliador: exp.nombre_conciliador || 'Sin asignar',
    conciliadorDni: exp.conciliador_dni || '',
    conciliadorRegistro: exp.conciliador_registro || '',
    conciliadorSede: exp.conciliador_sede_nombre || '',
    secretaria: exp.nombre_secretaria || '',
    fechaVencimiento: exp.fecha_vencimiento ? new Date(exp.fecha_vencimiento).toLocaleDateString('es-PE') : '',
    fechaAudiencia: ultimaAudiencia ? new Date(ultimaAudiencia.fecha).toLocaleDateString('es-PE') : '',
    lugar: ultimaAudiencia?.modalidad === 'Virtual' ? 'Virtual' : (exp.sede_direccion || 'Sede del Centro de Conciliación'),
    resultado: ultimaAudiencia?.resultado || '',
  };

  const data: any = { ...docData };
  let filePath: string;
  switch (tipoDocumento) {
    case 'Acta de Conciliacion':
      filePath = await generarActaConciliacion(data);
      break;
    case 'Esquela de Designacion':
      filePath = await generarEsquelaDesignacion(data);
      break;
    case 'Invitacion a Conciliar':
      data.fechaAudiencia = req.body.fechaAudiencia || data.fechaAudiencia || data.fecha;
      data.lugar = req.body.lugar || data.lugar || 'Sede del Centro de Conciliación';
      filePath = await generarInvitacionConciliacion(data);
      break;
    case 'Pre Aviso':
      filePath = await generarPreAviso(data);
      break;
    case 'Constancia de Asistencia':
      data.resultado = req.body.resultado || data.resultado || 'Asistieron';
      data.fechaAudiencia = req.body.fechaAudiencia || data.fechaAudiencia || data.fecha;
      filePath = await generarConstanciaAsistencia(data);
      break;
    default:
      return res.status(400).json({ message: `Tipo de documento no válido: ${tipoDocumento}` });
  }

  const result = await query(
    `INSERT INTO documentos_generados (expediente_id, tipo_documento, ruta_archivo, generado_por)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [expedienteId, tipoDocumento, filePath, req.usuario!.trabajadorId]
  );

  if (tipoDocumento === 'Pre Aviso') {
    await query('UPDATE expedientes SET pre_aviso_generado = true WHERE id = $1', [expedienteId]);
  }

  const fileName = filePath.split(/[/\\]/).pop();
  res.status(201).json({
    id: result.rows[0].id,
    tipoDocumento,
    rutaArchivo: `/uploads/documentos/${fileName}`,
    message: `${tipoDocumento} generado correctamente`,
  });
});

router.post('/registrar', sessionAuth, async (req: Request, res: Response) => {
  const { expedienteId, tipoDocumento, rutaArchivo } = req.body;
  const result = await query(
    `INSERT INTO documentos_generados (expediente_id, tipo_documento, ruta_archivo, generado_por)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [expedienteId, tipoDocumento, rutaArchivo, req.usuario!.trabajadorId]
  );
  if (tipoDocumento === 'Pre Aviso') {
    await query('UPDATE expedientes SET pre_aviso_generado = true WHERE id = $1', [expedienteId]);
  }
  res.status(201).json({ id: result.rows[0].id });
});

router.get('/preaviso/:expedienteId', sessionAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT pre_aviso_generado FROM expedientes WHERE id = $1', [req.params.expedienteId]);
  res.json(result.rows[0]);
});

export default router;
