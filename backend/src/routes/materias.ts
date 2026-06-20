import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';
import { validate } from '../validators/middleware';
import { materiaSchema, materiaUpdateSchema, requisitoSchema } from '../validators/schemas';

const router = Router();

router.get('/tipos', sessionAuth, async (_req: Request, res: Response) => {
  const result = await query('SELECT * FROM tipos_materia WHERE activo = true');
  res.json(result.rows);
});

router.get('/por-tipo/:tipoMateriaId', sessionAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM materias WHERE tipo_materia_id = $1 AND activo = true', [req.params.tipoMateriaId]);
  res.json(result.rows);
});

router.get('/:id', sessionAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT m.*, tm.nombre AS tipo_materia_nombre FROM materias m INNER JOIN tipos_materia tm ON m.tipo_materia_id = tm.id WHERE m.id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Materia no encontrada' });
  res.json(result.rows[0]);
});

router.get('/:id/requisitos', sessionAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM requisitos_materia_documento WHERE materia_id = $1 AND activo = true', [req.params.id]);
  res.json(result.rows);
});

router.post('/', sessionAuth, validate(materiaSchema), async (req: Request, res: Response) => {
  const { tipoMateriaId, nombre } = req.body;
  const result = await query(
    'INSERT INTO materias (tipo_materia_id, nombre) VALUES ($1,$2) RETURNING id',
    [tipoMateriaId, nombre]
  );
  res.status(201).json({ id: result.rows[0].id, message: 'Materia creada' });
});

router.put('/:id', sessionAuth, validate(materiaUpdateSchema), async (req: Request, res: Response) => {
  const { tipoMateriaId, nombre } = req.body;
  const result = await query(
    'UPDATE materias SET tipo_materia_id = COALESCE($1, tipo_materia_id), nombre = COALESCE($2, nombre) WHERE id = $3 RETURNING id',
    [tipoMateriaId, nombre, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Materia no encontrada' });
  res.json({ message: 'Materia actualizada' });
});

router.delete('/:id', sessionAuth, async (req: Request, res: Response) => {
  await query('UPDATE materias SET activo = false WHERE id = $1', [req.params.id]);
  res.json({ message: 'Materia eliminada' });
});

router.post('/requisitos', sessionAuth, validate(requisitoSchema), async (req: Request, res: Response) => {
  const { materiaId, nombreDoc, obligatorio } = req.body;
  const result = await query(
    'INSERT INTO requisitos_materia_documento (materia_id, nombre_doc, obligatorio) VALUES ($1,$2,$3) RETURNING id',
    [materiaId, nombreDoc, obligatorio]
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.put('/requisitos/:id', sessionAuth, async (req: Request, res: Response) => {
  await query('UPDATE requisitos_materia_documento SET activo = false WHERE id = $1', [req.params.id]);
  res.json({ message: 'Requisito eliminado' });
});

export default router;