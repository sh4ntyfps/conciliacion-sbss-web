import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET no está configurado en las variables de entorno');
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function sessionAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

export function requireRol(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    if (roles.length > 0 && !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }
    next();
  };
}
