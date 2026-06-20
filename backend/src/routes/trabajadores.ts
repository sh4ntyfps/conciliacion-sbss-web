import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, transaction } from '../config/database';
import { sessionAuth } from '../middleware/auth';
import { validate } from '../validators/middleware';
import { trabajadorSchema, trabajadorUpdateSchema } from '../validators/schemas';

const router = Router();

router.get('/', sessionAuth, async (_req: Request, res: Response) => {
  const result = await query(
    `SELECT t.*, s.nombre AS nombre_sede FROM trabajadores t
     INNER JOIN sedes s ON t.sede_id = s.id ORDER BY t.apellidos, t.nombres`
  );
  res.json(result.rows);
});

router.get('/:id', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT t.*, s.nombre AS nombre_sede FROM trabajadores t
     INNER JOIN sedes s ON t.sede_id = s.id WHERE t.id = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Trabajador no encontrado' });
  res.json(result.rows[0]);
});

router.get('/search/:dni', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT t.*, s.nombre AS nombre_sede FROM trabajadores t
     INNER JOIN sedes s ON t.sede_id = s.id
     WHERE t.dni LIKE $1 OR (t.nombres || ' ' || t.apellidos) LIKE $1`,
    [`%${req.params.dni}%`]
  );
  res.json(result.rows);
});

router.get('/conciliadores/:sedeId', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT id, nombres, apellidos, dni, email, registro_civil_comercial
     FROM trabajadores WHERE rol = 'Conciliador' AND sede_id = $1 AND activo = true ORDER BY apellidos`,
    [req.params.sedeId]
  );
  res.json(result.rows);
});

router.post('/', sessionAuth, validate(trabajadorSchema), async (req: Request, res: Response) => {
  const { nombres, apellidos, dni, telefono, email, password, rol, sedeId, registroCivilComercial } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await transaction(async (client) => {
    const t = await client.query(
      `INSERT INTO trabajadores (nombres,apellidos,dni,telefono,email,rol,sede_id,registro_civil_comercial)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [nombres, apellidos, dni, telefono || null, email, rol, sedeId, registroCivilComercial || null]
    );
    await client.query('INSERT INTO usuarios (trabajador_id, email, password_hash) VALUES ($1,$2,$3)', [t.rows[0].id, email, passwordHash]);
    return t.rows[0];
  });

  res.status(201).json({ id: result.id, message: 'Trabajador creado' });
});

router.put('/:id', sessionAuth, validate(trabajadorUpdateSchema), async (req: Request, res: Response) => {
  const { nombres, apellidos, telefono, rol, sedeId, registroCivilComercial } = req.body;
  await query(
    `UPDATE trabajadores SET nombres=$1,apellidos=$2,telefono=$3,rol=$4,sede_id=$5,registro_civil_comercial=$6 WHERE id=$7`,
    [nombres, apellidos, telefono, rol, sedeId, registroCivilComercial, req.params.id]
  );
  res.json({ message: 'Trabajador actualizado' });
});

router.put('/:id/toggle', sessionAuth, async (req: Request, res: Response) => {
  await transaction(async (client) => {
    await client.query('UPDATE trabajadores SET activo = NOT activo WHERE id = $1', [req.params.id]);
    await client.query('UPDATE usuarios SET activo = NOT activo WHERE trabajador_id = $1', [req.params.id]);
  });
  res.json({ message: 'Estado actualizado' });
});

export default router;