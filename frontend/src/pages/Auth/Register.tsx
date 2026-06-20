import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombres: '', apellidos: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email,
        password: form.password,
      });
      setSuccess('Registro exitoso. Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 460 }}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/25">
            <Scale size={28} className="text-white" />
          </div>
          <h1>SBSS</h1>
          <p className="login-subtitle">Crear cuenta de usuario</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <div className="form-group flex-1">
              <label>Nombres</label>
              <input value={form.nombres} onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))} required placeholder="Juan" />
            </div>
            <div className="form-group flex-1">
              <label>Apellidos</label>
              <input value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} required placeholder="Pérez" />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="correo@ejemplo.com" />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Mínimo 6 caracteres" style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required placeholder="Repita la contraseña" />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
            <UserPlus size={18} /> {loading ? 'Registrando...' : 'Crear Cuenta'}
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
