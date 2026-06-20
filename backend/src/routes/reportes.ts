import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';
import { exportarExcel, exportarPdf } from '../services/reportGenerator';
import path from 'path';
import fs from 'fs';

const router = Router();

async function getReportData(req: Request) {
  const { fecha_inicio, fecha_fin, sede_id } = req.query;
  const params: any[] = [fecha_inicio, fecha_fin];

  let sql = `
    SELECT
      e.id, e.numero_expediente, e.estado, e.motivo, e.pretensiones,
      e.fecha_creacion, e.fecha_vencimiento, e.fecha_cierre,
      m.nombre AS materia,
      tm.nombre AS tipo_materia,
      s.nombre AS sede,
      s.direccion AS sede_direccion,
      t.nombres || ' ' || t.apellidos AS conciliador,
      sec.nombres || ' ' || sec.apellidos AS secretaria,
      CASE
        WHEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.fecha_creacion))::INTEGER >= 10 THEN 'VENCIDO'
        WHEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.fecha_creacion))::INTEGER >= 9 THEN 'CRITICO'
        WHEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.fecha_creacion))::INTEGER >= 8 THEN 'ADVERTENCIA'
        ELSE 'NORMAL'
      END AS alerta_vencimiento,
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.fecha_creacion))::INTEGER AS dias_transcurridos,
      GREATEST(0, 10 - EXTRACT(DAY FROM (CURRENT_TIMESTAMP - e.fecha_creacion))::INTEGER) AS dias_restantes,
      (SELECT p.nombres || ' ' || p.apellidos || ' (' || COALESCE(p.dni, p.ruc) || ')'
       FROM partes_expediente pe JOIN personas p ON pe.persona_id = p.id
       WHERE pe.expediente_id = e.id AND pe.tipo_parte = 'Solicitante' LIMIT 1
      ) AS solicitante,
      (SELECT p.nombres || ' ' || p.apellidos || ' (' || COALESCE(p.dni, p.ruc) || ')'
       FROM partes_expediente pe JOIN personas p ON pe.persona_id = p.id
       WHERE pe.expediente_id = e.id AND pe.tipo_parte = 'Invitado' LIMIT 1
      ) AS invitado,
      (SELECT STRING_AGG(a.resultado, '; ') FROM audiencias a WHERE a.expediente_id = e.id AND a.resultado IS NOT NULL
      ) AS resultados_audiencias,
      (SELECT COUNT(*) FROM audiencias a WHERE a.expediente_id = e.id
      ) AS total_audiencias
    FROM expedientes e
    INNER JOIN materias m ON e.materia_id = m.id
    INNER JOIN tipos_materia tm ON m.tipo_materia_id = tm.id
    INNER JOIN sedes s ON e.sede_id = s.id
    LEFT JOIN trabajadores t ON e.conciliador_id = t.id
    LEFT JOIN trabajadores sec ON e.secretaria_id = sec.id
    WHERE e.fecha_creacion BETWEEN $1 AND $2`;
  if (sede_id) { params.push(sede_id); sql += ` AND e.sede_id = $${params.length}`; }
  sql += ' ORDER BY e.fecha_creacion DESC';

  const result = await query(sql, params);
  return result.rows;
}

router.get('/', sessionAuth, async (req: Request, res: Response) => {
  const data = await getReportData(req);
  res.json(data);
});

router.get('/excel', sessionAuth, async (req: Request, res: Response) => {
  try {
    const data = await getReportData(req);
    const filePath = await exportarExcel(data);
    const fileName = path.basename(filePath);
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    res.download(absolutePath, fileName, (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ message: 'Error al exportar Excel' });
  }
});

router.get('/pdf', sessionAuth, async (req: Request, res: Response) => {
  try {
    const data = await getReportData(req);
    const filePath = await exportarPdf(data);
    const fileName = path.basename(filePath);
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    res.download(absolutePath, fileName, (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ message: 'Error al exportar PDF' });
  }
});

export default router;
