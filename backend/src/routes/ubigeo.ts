import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';

const router = Router();

router.get('/departamentos', sessionAuth, async (_req: Request, res: Response) => {
  const result = await query('SELECT * FROM departamentos ORDER BY nombre');
  res.json(result.rows);
});

router.get('/provincias/:departamentoId', sessionAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM provincias WHERE departamento_id = $1 ORDER BY nombre', [req.params.departamentoId]);
  res.json(result.rows);
});

router.get('/distritos/:provinciaId', sessionAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM distritos WHERE provincia_id = $1 ORDER BY nombre', [req.params.provinciaId]);
  res.json(result.rows);
});

export default router;
