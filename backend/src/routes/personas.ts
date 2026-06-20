import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';
import { validate } from '../validators/middleware';
import { personaNaturalSchema, personaJuridicaSchema, personaUpdateSchema, apoderadoSchema, representanteSchema } from '../validators/schemas';

const router = Router();

router.get('/', sessionAuth, async (_req: Request, res: Response) => {
  const result = await query(
    `SELECT p.*, a.nombres AS apoderado_nombres, a.apellidos AS apoderado_apellidos, a.dni AS apoderado_dni,
            r.nombres AS representante_nombres, r.apellidos AS representante_apellidos, r.dni AS representante_dni, r.cargo,
            d.nombre AS nombre_distrito
     FROM personas p
     LEFT JOIN apoderados a ON p.apoderado_id = a.id
     LEFT JOIN representantes r ON p.representante_id = r.id
     LEFT JOIN distritos d ON p.distrito_id = d.id
     WHERE p.activo = true ORDER BY p.creado_en DESC`
  );
  res.json(result.rows);
});

router.get('/:id', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT p.*, a.nombres AS apoderado_nombres, a.apellidos AS apoderado_apellidos, a.dni AS apoderado_dni,
            r.nombres AS representante_nombres, r.apellidos AS representante_apellidos, r.dni AS representante_dni, r.cargo,
            d.nombre AS nombre_distrito, pr.nombre AS nombre_provincia, dep.nombre AS nombre_departamento
     FROM personas p
     LEFT JOIN apoderados a ON p.apoderado_id = a.id
     LEFT JOIN representantes r ON p.representante_id = r.id
     LEFT JOIN distritos d ON p.distrito_id = d.id
     LEFT JOIN provincias pr ON d.provincia_id = pr.id
     LEFT JOIN departamentos dep ON pr.departamento_id = dep.id
     WHERE p.id = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Persona no encontrada' });
  res.json(result.rows[0]);
});

router.get('/buscar/:documento', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT p.*, a.nombres AS apoderado_nombres, a.apellidos AS apoderado_apellidos,
            r.nombres AS representante_nombres, r.apellidos AS representante_apellidos
     FROM personas p
     LEFT JOIN apoderados a ON p.apoderado_id = a.id
     LEFT JOIN representantes r ON p.representante_id = r.id
     WHERE (p.dni = $1 OR p.ruc = $1) AND p.activo = true`,
    [req.params.documento]
  );
  res.json(result.rows);
});

router.post('/natural', sessionAuth, validate(personaNaturalSchema), async (req: Request, res: Response) => {
  const { nombres, apellidos, dni, telefono, email, direccion, distritoId, apoderadoId } = req.body;
  const result = await query(
    `INSERT INTO personas (tipo_persona, nombres, apellidos, dni, telefono, email, direccion, distrito_id, apoderado_id)
     VALUES ('Natural', $1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [nombres, apellidos, dni, telefono || null, email || null, direccion || null, distritoId || null, apoderadoId || null]
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.post('/juridica', sessionAuth, validate(personaJuridicaSchema), async (req: Request, res: Response) => {
  const { razonSocial, ruc, telefono, email, direccion, distritoId, representanteId } = req.body;
  const result = await query(
    `INSERT INTO personas (tipo_persona, razon_social, ruc, telefono, email, direccion, distrito_id, representante_id)
     VALUES ('Juridica', $1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [razonSocial, ruc, telefono || null, email || null, direccion || null, distritoId || null, representanteId || null]
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.put('/:id', sessionAuth, validate(personaUpdateSchema), async (req: Request, res: Response) => {
  const { telefono, email, direccion, distritoId, apoderadoId, representanteId } = req.body;
  await query(
    `UPDATE personas SET telefono=$1, email=$2, direccion=$3, distrito_id=$4, apoderado_id=$5, representante_id=$6 WHERE id=$7`,
    [telefono, email, direccion, distritoId, apoderadoId || null, representanteId || null, req.params.id]
  );
  res.json({ message: 'Persona actualizada' });
});

router.put('/:id/toggle', sessionAuth, async (req: Request, res: Response) => {
  await query('UPDATE personas SET activo = NOT activo WHERE id = $1', [req.params.id]);
  res.json({ message: 'Estado actualizado' });
});

router.post('/apoderados', sessionAuth, validate(apoderadoSchema), async (req: Request, res: Response) => {
  const { nombres, apellidos, dni, telefono, email } = req.body;
  const result = await query(
    'INSERT INTO apoderados (nombres, apellidos, dni, telefono, email) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [nombres, apellidos, dni, telefono || null, email || null]
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.put('/apoderados/:id', sessionAuth, validate(apoderadoSchema), async (req: Request, res: Response) => {
  const { nombres, apellidos, dni, telefono, email } = req.body;
  await query('UPDATE apoderados SET nombres=$1,apellidos=$2,dni=$3,telefono=$4,email=$5 WHERE id=$6',
    [nombres, apellidos, dni, telefono, email, req.params.id]);
  res.json({ message: 'Apoderado actualizado' });
});

router.get('/apoderados/:id', sessionAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM apoderados WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
  res.json(result.rows[0]);
});

router.post('/representantes', sessionAuth, validate(representanteSchema), async (req: Request, res: Response) => {
  const { nombres, apellidos, dni, cargo, telefono, email } = req.body;
  const result = await query(
    'INSERT INTO representantes (nombres, apellidos, dni, cargo, telefono, email) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
    [nombres, apellidos, dni, cargo || null, telefono || null, email || null]
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.put('/representantes/:id', sessionAuth, validate(representanteSchema), async (req: Request, res: Response) => {
  const { nombres, apellidos, dni, cargo, telefono, email } = req.body;
  await query('UPDATE representantes SET nombres=$1,apellidos=$2,dni=$3,cargo=$4,telefono=$5,email=$6 WHERE id=$7',
    [nombres, apellidos, dni, cargo, telefono, email, req.params.id]);
  res.json({ message: 'Representante actualizado' });
});

router.get('/representantes/:id', sessionAuth, async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM representantes WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
  res.json(result.rows[0]);
});

export default router;