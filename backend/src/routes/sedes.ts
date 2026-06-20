import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';
import { validate } from '../validators/middleware';
import { sedeSchema } from '../validators/schemas';

const router = Router();

router.get('/', sessionAuth, async (_req: Request, res: Response) => {
  const result = await query('SELECT * FROM sedes ORDER BY nombre');
  res.json(result.rows);
});

router.get('/:id', sessionAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM sedes WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Sede no encontrada' });
  res.json(result.rows[0]);
});

router.post('/', sessionAuth, validate(sedeSchema), async (req: Request, res: Response) => {
  const { nombre, direccion, telefono } = req.body;
  const result = await query(
    'INSERT INTO sedes (nombre, direccion, telefono) VALUES ($1,$2,$3) RETURNING id',
    [nombre, direccion || null, telefono || null]
  );
  res.status(201).json({ id: result.rows[0].id, message: 'Sede creada' });
});

router.put('/:id', sessionAuth, validate(sedeSchema), async (req: Request, res: Response) => {
  const { nombre, direccion, telefono } = req.body;
  await query('UPDATE sedes SET nombre=$1, direccion=$2, telefono=$3 WHERE id=$4', [nombre, direccion, telefono, req.params.id]);
  res.json({ message: 'Sede actualizada' });
});

router.put('/:id/toggle', sessionAuth, async (req: Request, res: Response) => {
  await query('UPDATE sedes SET activo = NOT activo WHERE id = $1', [req.params.id]);
  res.json({ message: 'Estado actualizado' });
});

export default router;