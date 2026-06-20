import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, transaction } from '../config/database';
import { generateToken, sessionAuth } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { validate } from '../validators/middleware';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validators/schemas';

const router = Router();

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      `SELECT u.id, u.email, u.password_hash, u.trabajador_id,
              t.nombres, t.apellidos, t.rol, t.sede_id, s.nombre AS nombre_sede
       FROM usuarios u
       INNER JOIN trabajadores t ON u.trabajador_id = t.id
       INNER JOIN sedes s ON t.sede_id = s.id
       WHERE u.email = $1 AND u.activo = true AND t.activo = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    await query('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = generateToken({
      usuarioId: user.id,
      trabajadorId: user.trabajador_id,
      email: user.email,
      rol: user.rol,
      sedeId: user.sede_id,
    });

    res.json({
      token,
      usuario: {
        id: user.trabajador_id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol,
        sedeId: user.sede_id,
        nombreSede: user.nombre_sede,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { nombres, apellidos, dni, telefono, email, password, rol, sedeId, registroCivilComercial } = req.body;

    const exists = await query('SELECT id FROM trabajadores WHERE email = $1 OR dni = $2', [email, dni]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'El email o DNI ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await transaction(async (client) => {
      const t = await client.query(
        `INSERT INTO trabajadores (nombres, apellidos, dni, telefono, email, rol, sede_id, registro_civil_comercial)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [nombres, apellidos, dni, telefono || null, email, rol, sedeId, registroCivilComercial || null]
      );
      const trabajadorId = t.rows[0].id;
      await client.query(
        'INSERT INTO usuarios (trabajador_id, email, password_hash) VALUES ($1,$2,$3)',
        [trabajadorId, email, passwordHash]
      );
      return { trabajadorId };
    });

    res.status(201).json({ message: 'Usuario creado exitosamente', id: result.trabajadorId });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const token = uuidv4();
    const expira = new Date(Date.now() + 3600000);

    const result = await query(
      `UPDATE usuarios SET token_recovery = $1, token_expira = $2 WHERE email = $3 AND activo = true RETURNING id`,
      [token, expira, email]
    );

    if (result.rows.length === 0) {
      return res.json({ message: 'Si el email existe, recibirás instrucciones' });
    }

    res.json({ message: 'Si el email existe, recibirás instrucciones' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await query(
      `UPDATE usuarios SET password_hash = $1, token_recovery = NULL, token_expira = NULL
       WHERE token_recovery = $2 AND token_expira > CURRENT_TIMESTAMP RETURNING id`,
      [passwordHash, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/me', sessionAuth, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT t.id, t.nombres, t.apellidos, t.dni, t.telefono, t.email, t.rol, t.sede_id, s.nombre AS nombre_sede
     FROM trabajadores t INNER JOIN sedes s ON t.sede_id = s.id WHERE t.id = $1`,
    [req.usuario!.trabajadorId]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(result.rows[0]);
});

router.put('/change-password', sessionAuth, validate(changePasswordSchema), async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userResult = await query('SELECT password_hash FROM usuarios WHERE trabajador_id = $1', [req.usuario!.trabajadorId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!valid) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE usuarios SET password_hash = $1 WHERE trabajador_id = $2', [passwordHash, req.usuario!.trabajadorId]);

    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

export default router;