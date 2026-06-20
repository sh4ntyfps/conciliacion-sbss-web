import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="login-page">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 mx-auto shadow-lg shadow-red-500/25">
          <ShieldOff size={32} className="text-white" />
        </div>
        <h1 style={{ marginBottom: 8 }}>Acceso Denegado</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
          No tiene permisos suficientes para acceder a esta página.
          Si cree que esto es un error, contacte al administrador del sistema.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/dashboard" className="btn btn-primary">
            <Home size={18} /> Ir al Dashboard
          </Link>
          <Link to="/login" className="btn btn-secondary">
            <ArrowLeft size={18} /> Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
