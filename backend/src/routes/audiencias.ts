import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';
import { emitNotification } from '../index';
import { validate } from '../validators/middleware';
import { audienciaSchema, audienciaResultadoSchema } from '../validators/schemas';

const router = Router();

router.get('/expediente/:expedienteId', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    'SELECT * FROM audiencias WHERE expediente_id = $1 ORDER BY creado_en DESC',
    [req.params.expedienteId]
  );
  res.json(result.rows);
});

router.post('/', sessionAuth, validate(audienciaSchema), async (req: Request, res: Response) => {
  const { expedienteId, fecha, modalidad } = req.body;

  const result = await query(
    'INSERT INTO audiencias (expediente_id, fecha, modalidad) VALUES ($1,$2,$3) RETURNING id',
    [expedienteId, fecha, modalidad]
  );
  await query("UPDATE expedientes SET estado = 'AUDIENCIA PROGRAMADA' WHERE id = $1", [expedienteId]);

  emitNotification('audiencia_creada', { id: result.rows[0].id, expedienteId });
  res.status(201).json({ id: result.rows[0].id });
});

router.put('/:id/resultado', sessionAuth, validate(audienciaResultadoSchema), async (req: Request, res: Response) => {
  const { expedienteId, resultado, observaciones } = req.body;

  const estado = resultado === 'Suspension' ? 'SUSPENDIDA' : 'REALIZADA';
  await query(
    'UPDATE audiencias SET resultado=$1, observaciones=$2, estado=$3 WHERE id=$4',
    [resultado, observaciones || null, estado, req.params.id]
  );

  const estadosExpediente: Record<string, string> = {
    'Acuerdo Total': 'CONCILIADO',
    'Acuerdo Parcial': 'CONCILIADO',
    'Falta de Acuerdo': 'NO CONCILIADO',
  };

  if (estadosExpediente[resultado]) {
    const nuevoEstado = estadosExpediente[resultado];
    const fechaCierre = nuevoEstado === 'CONCILIADO' || nuevoEstado === 'NO CONCILIADO'
      ? ', fecha_cierre = CURRENT_TIMESTAMP' : '';
    await query(`UPDATE expedientes SET estado = $1 ${fechaCierre} WHERE id = $2`, [nuevoEstado, expedienteId]);
  }

  emitNotification('resultado_registrado', { audienciaId: Number(req.params.id), expedienteId, resultado });
  res.json({ message: 'Resultado registrado' });
});

export default router;