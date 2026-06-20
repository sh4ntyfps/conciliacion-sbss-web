import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';
import { emitNotification } from '../index';
import { validate } from '../validators/middleware';
import { expedienteSchema, expedienteEstadoSchema, asignarConciliadorSchema, parteSchema, mesaPartesSchema } from '../validators/schemas';

const router = Router();

router.get('/', sessionAuth, async (req: Request, res: Response) => {
  const { sede_id, estado, conciliador_id } = req.query;
  const params: any[] = [];
  let sql = 'SELECT * FROM vw_expedientes_con_alerta WHERE 1=1';

  if (sede_id) { params.push(sede_id); sql += ` AND sede_id = $${params.length}`; }
  if (estado) { params.push(estado); sql += ` AND estado = $${params.length}`; }
  if (conciliador_id) { params.push(conciliador_id); sql += ` AND conciliador_id = $${params.length}`; }

  if (req.usuario!.rol === 'Conciliador') {
    params.push(req.usuario!.trabajadorId);
    sql += ` AND conciliador_id = $${params.length}`;
  } else if (req.usuario!.rol !== 'Administrador') {
    params.push(req.usuario!.sedeId);
    sql += ` AND sede_id = $${params.length}`;
  }

  sql += ' ORDER BY fecha_creacion DESC';
  const result = await query(sql, params);
  res.json(result.rows);
});

router.get('/conciliador', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT * FROM vw_expedientes_con_alerta
     WHERE conciliador_id = $1 AND estado NOT IN ('CERRADO','VENCIDO')
     ORDER BY fecha_creacion DESC`,
    [req.usuario!.trabajadorId]
  );
  res.json(result.rows);
});

router.get('/generar-numero/:sedeId', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT 'EXP-' || LPAD((COALESCE(COUNT(*),0)+1)::TEXT,4,'0') || '-' || TO_CHAR(CURRENT_TIMESTAMP,'YYYY') AS numero_expediente
     FROM expedientes WHERE sede_id = $1 AND EXTRACT(YEAR FROM fecha_creacion) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP)`,
    [req.params.sedeId]
  );
  res.json({ numero: result.rows[0].numero_expediente });
});

router.get('/:id', sessionAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM vw_expedientes_con_alerta WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Expediente no encontrado' });
  res.json(result.rows[0]);
});

router.post('/', sessionAuth, validate(expedienteSchema), async (req: Request, res: Response) => {
  const { materiaId, sedeId, secretariaId, motivo, pretensiones } = req.body;

  const numResult = await query(
    `SELECT 'EXP-' || LPAD((COALESCE(COUNT(*),0)+1)::TEXT,4,'0') || '-' || TO_CHAR(CURRENT_TIMESTAMP,'YYYY') AS numero_expediente
     FROM expedientes WHERE sede_id = $1 AND EXTRACT(YEAR FROM fecha_creacion) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP)`,
    [sedeId]
  );
  const numeroExpediente = numResult.rows[0].numero_expediente;

  const result = await query(
    `INSERT INTO expedientes (numero_expediente, materia_id, sede_id, secretaria_id, motivo, pretensiones)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [numeroExpediente, materiaId, sedeId, secretariaId, motivo || null, pretensiones || null]
  );

  emitNotification('expediente_creado', { id: result.rows[0].id, numero: numeroExpediente });
  res.status(201).json({ id: result.rows[0].id, numero: numeroExpediente });
});

router.put('/:id/estado', sessionAuth, validate(expedienteEstadoSchema), async (req: Request, res: Response) => {
  const { estado } = req.body;
  const check = await query('SELECT estado FROM expedientes WHERE id = $1', [req.params.id]);
  if (check.rows.length === 0) return res.status(404).json({ message: 'Expediente no encontrado' });
  if (check.rows[0].estado === 'CERRADO') return res.status(400).json({ message: 'El expediente está cerrado' });

  let sql = 'UPDATE expedientes SET estado = $1 WHERE id = $2';
  if (['CONCILIADO', 'NO CONCILIADO', 'CERRADO'].includes(estado)) {
    sql = 'UPDATE expedientes SET estado = $1, fecha_cierre = CURRENT_TIMESTAMP WHERE id = $2';
  }
  await query(sql, [estado, req.params.id]);

  emitNotification('estado_cambiado', { id: Number(req.params.id), estado });
  res.json({ message: 'Estado actualizado' });
});

router.put('/:id/asignar-conciliador', sessionAuth, validate(asignarConciliadorSchema), async (req: Request, res: Response) => {
  const { conciliadorId } = req.body;
  const result = await query(
    `UPDATE expedientes SET conciliador_id = $1, estado = 'EN PROCESO' WHERE id = $2 AND estado = 'REGISTRADO' RETURNING id`,
    [conciliadorId, req.params.id]
  );
  if (result.rows.length === 0) return res.status(400).json({ message: 'No se pudo asignar. Verifique el estado del expediente.' });

  emitNotification('conciliador_asignado', { id: Number(req.params.id), conciliadorId });
  res.json({ message: 'Conciliador asignado' });
});

router.get('/:id/partes', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT pe.tipo_parte, p.*, a.nombres AS apoderado_nombres, a.apellidos AS apoderado_apellidos,
            r.nombres AS representante_nombres, r.apellidos AS representante_apellidos, r.cargo
     FROM partes_expediente pe
     INNER JOIN personas p ON pe.persona_id = p.id
     LEFT JOIN apoderados a ON p.apoderado_id = a.id
     LEFT JOIN representantes r ON p.representante_id = r.id
     WHERE pe.expediente_id = $1`,
    [req.params.id]
  );
  res.json(result.rows);
});

router.post('/:id/partes', sessionAuth, validate(parteSchema), async (req: Request, res: Response) => {
  const { personaId, tipoParte } = req.body;
  await query(
    'INSERT INTO partes_expediente (expediente_id, persona_id, tipo_parte) VALUES ($1,$2,$3)',
    [req.params.id, personaId, tipoParte]
  );
  emitNotification('parte_agregada', { expedienteId: Number(req.params.id), personaId });
  res.status(201).json({ message: 'Parte agregada' });
});

router.get('/:id/mesa-partes', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT dmp.*, r.nombre_doc, r.obligatorio
     FROM documentos_mesa_partes dmp
     INNER JOIN requisitos_materia_documento r ON dmp.requisito_id = r.id
     WHERE dmp.expediente_id = $1`,
    [req.params.id]
  );
  res.json(result.rows);
});

router.post('/:id/mesa-partes', sessionAuth, validate(mesaPartesSchema), async (req: Request, res: Response) => {
  const { requisitoId, presentado } = req.body;
  await query(
    `INSERT INTO documentos_mesa_partes (expediente_id, requisito_id, presentado)
     VALUES ($1, $2, $3)
     ON CONFLICT (expediente_id, requisito_id)
     DO UPDATE SET presentado = $3`,
    [req.params.id, requisitoId, presentado]
  );
  res.json({ message: 'Documento registrado' });
});

router.get('/:id/alertas', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT COUNT(*) AS total_faltantes FROM documentos_mesa_partes dmp
     INNER JOIN requisitos_materia_documento r ON dmp.requisito_id = r.id
     WHERE dmp.expediente_id = $1 AND dmp.presentado = false AND r.obligatorio = true`,
    [req.params.id]
  );
  res.json(result.rows[0]);
});

export default router;