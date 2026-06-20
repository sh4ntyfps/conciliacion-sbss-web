import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/videos');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error(`Formato no permitido: ${ext}. Use: ${allowed.join(', ')}`));
  },
});

const router = Router();

router.get('/:expedienteId', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT v.*, t.nombres || ' ' || t.apellidos AS subido_por_nombre
     FROM videos v LEFT JOIN trabajadores t ON v.subido_por = t.id
     WHERE v.expediente_id = $1 ORDER BY v.subido_en DESC`,
    [req.params.expedienteId]
  );
  res.json(result.rows);
});

router.post('/:expedienteId/upload', sessionAuth, (req: Request, res: Response) => {
  upload.single('video')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'Video requerido' });

    const result = await query(
      `INSERT INTO videos (expediente_id, nombre_video, ruta_video, subido_por)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [req.params.expedienteId, req.file.originalname, req.file.path, req.usuario!.trabajadorId]
    );
    res.status(201).json({ id: result.rows[0].id, nombreVideo: req.file.originalname });
  });
});

router.delete('/:id', sessionAuth, async (req: Request, res: Response) => {
  const file = await query('SELECT ruta_video FROM videos WHERE id = $1', [req.params.id]);
  if (file.rows.length > 0 && fs.existsSync(file.rows[0].ruta_video)) {
    fs.unlinkSync(file.rows[0].ruta_video);
  }
  await query('DELETE FROM videos WHERE id = $1', [req.params.id]);
  res.json({ message: 'Video eliminado' });
});

export default router;
