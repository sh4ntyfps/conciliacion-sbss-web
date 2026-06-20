import { useState, type FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Scale, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Token de recuperación inválido o expirado.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess('Contraseña actualizada exitosamente. Redirigiendo...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="alert alert-error">Enlace de recuperación inválido o expirado. Solicite uno nuevo.</div>
          <Link to="/forgot-password" className="back-link" style={{ justifyContent: 'center' }}>
            <ArrowLeft size={16} /> Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/25">
            <Scale size={28} className="text-white" />
          </div>
          <h1>SBSS</h1>
          <p className="login-subtitle">Restablecer contraseña</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nueva Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repita la contraseña" />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            <KeyRound size={18} /> {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
