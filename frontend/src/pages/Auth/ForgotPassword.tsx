import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Mail, ArrowLeft, Send } from 'lucide-react';
import { authApi } from '../../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar correo de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/25">
            <Scale size={28} className="text-white" />
          </div>
          <h1>SBSS</h1>
          <p className="login-subtitle">Recuperar contraseña</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {sent ? (
          <div className="alert alert-success" style={{ textAlign: 'center', padding: 24 }}>
            <Mail size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Correo enviado</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Si el correo {email} está registrado, recibirá instrucciones para restablecer su contraseña.
            </p>
            <Link to="/login" className="back-link" style={{ marginTop: 16, justifyContent: 'center' }}>
              <ArrowLeft size={16} /> Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20, textAlign: 'center' }}>
              Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
            </p>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="correo@ejemplo.com" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              <Send size={18} /> {loading ? 'Enviando...' : 'Enviar Enlace'}
            </button>
          </form>
        )}

        {!sent && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/login" className="back-link">
              <ArrowLeft size={16} /> Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
