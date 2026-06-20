import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';

const router = Router();

router.get('/indicadores', sessionAuth, async (req: Request, res: Response) => {
  const sedeId = req.usuario!.rol !== 'Administrador' ? req.usuario!.sedeId : req.query.sede_id || null;
  const params: any[] = [];
  let sql = `SELECT COUNT(*) AS total_expedientes,
                    SUM(CASE WHEN estado='EN PROCESO' THEN 1 ELSE 0 END) AS en_proceso,
                    SUM(CASE WHEN estado='REGISTRADO' THEN 1 ELSE 0 END) AS pendientes,
                    SUM(CASE WHEN estado='AUDIENCIA PROGRAMADA' THEN 1 ELSE 0 END) AS audiencia_programada,
                    SUM(CASE WHEN estado='CONCILIADO' THEN 1 ELSE 0 END) AS conciliados,
                    SUM(CASE WHEN estado='NO CONCILIADO' THEN 1 ELSE 0 END) AS no_conciliados,
                    SUM(CASE WHEN estado='CERRADO' THEN 1 ELSE 0 END) AS cerrados,
                    SUM(CASE WHEN estado='VENCIDO' THEN 1 ELSE 0 END) AS vencidos
             FROM expedientes WHERE activo = true`;

  if (sedeId) { params.push(sedeId); sql += ` AND sede_id = $${params.length}`; }

  const result = await query(sql, params);
  res.json(result.rows[0]);
});

router.get('/trimestres', sessionAuth, async (req: Request, res: Response) => {
  const anio = req.query.anio || new Date().getFullYear();
  const sedeId = req.usuario!.rol !== 'Administrador' ? req.usuario!.sedeId : req.query.sede_id || null;

  const params: any[] = [anio];
  let sql = `SELECT EXTRACT(QUARTER FROM fecha_creacion) AS trimestre, COUNT(*) AS total
             FROM expedientes WHERE EXTRACT(YEAR FROM fecha_creacion) = $1 AND activo = true`;
  if (sedeId) { params.push(sedeId); sql += ` AND sede_id = $${params.length}`; }
  sql += ' GROUP BY EXTRACT(QUARTER FROM fecha_creacion) ORDER BY trimestre';

  const result = await query(sql, params);
  res.json(result.rows);
});

router.get('/alertas', sessionAuth, async (req: Request, res: Response) => {
  const sedeId = req.usuario!.rol !== 'Administrador' ? req.usuario!.sedeId : null;
  const params: any[] = [];
  let sql = `SELECT COUNT(*) AS total FROM vw_expedientes_con_alerta
             WHERE alerta_vencimiento IN ('ADVERTENCIA','CRITICO')
             AND estado NOT IN ('CERRADO','VENCIDO','CONCILIADO','NO CONCILIADO')`;
  if (sedeId) { params.push(sedeId); sql += ` AND sede_id = $${params.length}`; }

  const countResult = await query(sql, params);

  params.length = 0;
  sql = `SELECT id, numero_expediente, estado, alerta_vencimiento, dias_restantes, nombre_conciliador, fecha_creacion
         FROM vw_expedientes_con_alerta
         WHERE alerta_vencimiento IN ('ADVERTENCIA','CRITICO')
         AND estado NOT IN ('CERRADO','VENCIDO','CONCILIADO','NO CONCILIADO')`;
  if (sedeId) { params.push(sedeId); sql += ` AND sede_id = $${params.length}`; }
  sql += ' ORDER BY dias_restantes ASC LIMIT 10';

  const listResult = await query(sql, params);
  res.json({ total: parseInt(countResult.rows[0].total), alerts: listResult.rows });
});

router.get('/expedientes-por-estado', sessionAuth, async (req: Request, res: Response) => {
  const sedeId = req.usuario!.rol !== 'Administrador' ? req.usuario!.sedeId : req.query.sede_id || null;
  const estados = ['REGISTRADO', 'EN PROCESO', 'AUDIENCIA PROGRAMADA', 'CONCILIADO', 'NO CONCILIADO', 'CERRADO', 'VENCIDO'];

  const result: any = {};
  for (const estado of estados) {
    const params: any[] = [estado];
    let sql = `SELECT id, numero_expediente, estado, alerta_vencimiento, dias_restantes, nombre_materia, nombre_sede, nombre_conciliador, fecha_creacion
               FROM vw_expedientes_con_alerta WHERE estado = $1 AND activo = true`;
    if (sedeId) { params.push(sedeId); sql += ` AND sede_id = $${params.length}`; }
    sql += ' ORDER BY fecha_creacion DESC LIMIT 5';
    const rows = await query(sql, params);
    result[estado] = rows.rows;
  }
  res.json(result);
});

router.get('/audiencias-por-mes', sessionAuth, async (req: Request, res: Response) => {
  const anio = req.query.anio || new Date().getFullYear();
  const result = await query(
    `SELECT EXTRACT(MONTH FROM fecha) AS mes, COUNT(*) AS total
     FROM audiencias WHERE EXTRACT(YEAR FROM fecha) = $1 GROUP BY EXTRACT(MONTH FROM fecha) ORDER BY mes`,
    [anio]
  );
  res.json(result.rows);
});

export default router;
