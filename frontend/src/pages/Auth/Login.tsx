import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Scale, LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { dark } = useTheme();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden p-6 transition-colors duration-300 ${dark ? 'bg-[#070a12]' : 'bg-slate-50'}`}>
      {/* Background decorations - only in dark mode */}
      {dark && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(15,110,205,0.12)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(167,139,250,0.08)_0%,transparent_50%)]" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/8 to-transparent -top-40 -right-40 pointer-events-none" style={{ animation: 'float 8s ease-in-out infinite' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-purple-500/6 to-transparent -bottom-32 -left-32 pointer-events-none" style={{ animation: 'float 10s ease-in-out infinite reverse' }} />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute rounded-full" style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: `rgba(${i % 2 === 0 ? '59,130,246' : '167,139,250'},${0.15 + Math.random() * 0.2})`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `particleFloat ${18 + Math.random() * 12}s infinite ease-in-out`,
                animationDelay: `${-Math.random() * 25}s`,
              }} />
            ))}
          </div>
        </>
      )}

      {/* Light mode accent */}
      {!dark && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80" />
      )}

      <div className="w-full max-w-sm relative z-10" style={{ animation: 'scaleIn 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-16">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-xl transition-colors duration-300 ${dark ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/25 ring-2 ring-blue-400/15' : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/20'}`}>
            <Scale size={40} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold tracking-tight transition-colors duration-300 ${dark ? 'text-white' : 'text-slate-800'}`}>SBSS</h1>
          <p className={`text-xs mt-2 font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Conciliaciones</p>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h2 className={`text-2xl font-semibold mb-2 transition-colors duration-300 ${dark ? 'text-white' : 'text-slate-800'}`}>Bienvenido</h2>
          <p className={`text-sm leading-relaxed transition-colors duration-300 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Ingrese sus credenciales para acceder al sistema</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 mb-8 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/15" style={{ animation: 'slideDown 0.3s ease' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 transition-colors duration-300 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Correo electrónico</label>
            <div className="relative flex items-center">
              <Mail size={18} className={`absolute left-4 pointer-events-none transition-colors duration-300 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="nombre@sbss.pe"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm placeholder:transition-colors focus:outline-none focus:border-blue-500/40 transition-all duration-200 ${
                  dark
                    ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600'
                    : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-sm'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 transition-colors duration-300 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Contraseña</label>
            <div className="relative flex items-center">
              <Lock size={18} className={`absolute left-4 pointer-events-none transition-colors duration-300 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Ingrese su contraseña"
                className={`w-full pl-11 pr-11 py-3.5 rounded-xl border text-sm placeholder:transition-colors focus:outline-none focus:border-blue-500/40 transition-all duration-200 ${
                  dark
                    ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600'
                    : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-sm'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className={`absolute right-3.5 transition-colors cursor-pointer border-none bg-transparent p-1 ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} /> Iniciar sesión
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-10 text-sm">
          <Link to="/forgot-password" className={`transition-colors no-underline font-medium ${dark ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}`}>
            ¿Olvidó su contraseña?
          </Link>
          <Link to="/" className={`inline-flex items-center gap-1.5 transition-colors no-underline font-medium ${dark ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}`}>
            Volver <ArrowRight size={16} />
          </Link>
        </div>

        <p className={`text-center text-xs mt-16 transition-colors duration-300 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
          &copy; {new Date().getFullYear()} SBSS — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
