import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const type = req.baseUrl.includes('videos') ? 'videos' : 'repositorio';
    const uploadPath = path.join(__dirname, '../../uploads', type);
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

const router = Router();

router.get('/:expedienteId', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT r.*, t.nombres || ' ' || t.apellidos AS subido_por_nombre
     FROM repositorio r LEFT JOIN trabajadores t ON r.subido_por = t.id
     WHERE r.expediente_id = $1 ORDER BY r.subido_en DESC`,
    [req.params.expedienteId]
  );
  res.json(result.rows);
});

router.post('/:expedienteId/upload', sessionAuth, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

  const result = await query(
    `INSERT INTO repositorio (expediente_id, nombre_archivo, tipo_archivo, ruta_archivo, tamanio, subido_por)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [req.params.expedienteId, req.file.originalname, req.file.mimetype, req.file.path, req.file.size, req.usuario!.trabajadorId]
  );
  res.status(201).json({ id: result.rows[0].id });
});

router.delete('/:id', sessionAuth, async (req: Request, res: Response) => {
  const file = await query('SELECT ruta_archivo FROM repositorio WHERE id = $1', [req.params.id]);
  if (file.rows.length > 0 && fs.existsSync(file.rows[0].ruta_archivo)) {
    fs.unlinkSync(file.rows[0].ruta_archivo);
  }
  await query('DELETE FROM repositorio WHERE id = $1', [req.params.id]);
  res.json({ message: 'Archivo eliminado' });
});

export default router;
