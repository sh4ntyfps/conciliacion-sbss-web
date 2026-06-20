import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import { startBackgroundJobs } from './services/backgroundJobs';

import authRoutes from './routes/auth';
import sedeRoutes from './routes/sedes';
import trabajadorRoutes from './routes/trabajadores';
import personaRoutes from './routes/personas';
import materiaRoutes from './routes/materias';
import expedienteRoutes from './routes/expedientes';
import audienciaRoutes from './routes/audiencias';
import dashboardRoutes from './routes/dashboard';
import reporteRoutes from './routes/reportes';
import repositorioRoutes from './routes/repositorio';
import documentoRoutes from './routes/documentos';
import ubigeoRoutes from './routes/ubigeo';
import chatbotRoutes from './routes/chatbot';
import videoRoutes from './routes/videos';

const app = express();
const httpServer = createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const io = new SocketServer(httpServer, { cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST', 'PUT', 'DELETE'] } });

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(morgan('dev'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Demasiados intentos. Intente de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/sedes', sedeRoutes);
app.use('/api/trabajadores', trabajadorRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api/audiencias', audienciaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/repositorio', repositorioRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/ubigeo', ubigeoRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/videos', videoRoutes);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

export function emitNotification(event: string, data: any) {
  io.emit(event, data);
}

startBackgroundJobs();

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
