import { Link } from 'react-router-dom';
import { Scale, FolderOpen, Users, CalendarDays, FileText, BarChart3, Shield, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="home-gradient-bg" />

      {/* Floating particles */}
      <div className="home-particles">
        <div className="particle p1" />
        <div className="particle p2" />
        <div className="particle p3" />
        <div className="particle p4" />
        <div className="particle p5" />
        <div className="particle p6" />
      </div>

      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          <div className="home-logo">
            <div className="home-logo-icon">
              <Scale size={24} />
            </div>
            <span className="home-logo-text">SBSS</span>
          </div>
          <div className="home-nav-links">
            <Link to="/login" className="home-nav-btn">Ingresar</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-badge">Sistema de Gestión de Conciliaciones</div>
          <h1 className="home-hero-title">
            Gestión inteligente de
            <span className="home-hero-gradient"> conciliaciones extrajudiciales</span>
          </h1>
          <p className="home-hero-desc">
            Plataforma integral para la administración de expedientes, audiencias, personas y reportes
            del Centro de Conciliación Extrajudicial SBSS.
          </p>
          <div className="home-hero-actions">
            <Link to="/login" className="home-cta-primary">
              Iniciar Sesión <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="home-hero-visual">
          <div className="home-hero-card">
            <div className="hero-card-item" style={{ animationDelay: '0.1s' }}>
              <div className="hero-card-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FolderOpen size={18} /></div>
              <div><strong>Exp-2026-0042</strong><span>Conciliación Familiar</span></div>
              <span className="hero-card-badge" style={{ background: '#d1fae5', color: '#065f46' }}>CONCILIADO</span>
            </div>
            <div className="hero-card-item" style={{ animationDelay: '0.2s' }}>
              <div className="hero-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}><CalendarDays size={18} /></div>
              <div><strong>Audiencia Pendiente</strong><span>15 Jun 2026 - 10:00</span></div>
              <span className="hero-card-badge" style={{ background: '#fef3c7', color: '#92400e' }}>PROGRAMADA</span>
            </div>
            <div className="hero-card-item" style={{ animationDelay: '0.3s' }}>
              <div className="hero-card-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}><Users size={18} /></div>
              <div><strong>Personas Registradas</strong><span>Juan Pérez, María López...</span></div>
              <span className="hero-card-badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>+150</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home-features">
        <h2 className="home-section-title">Módulos del Sistema</h2>
        <div className="home-features-grid">
          {[
            { icon: FolderOpen, title: 'Expedientes', desc: 'Gestión completa del ciclo de vida de expedientes con 7 estados y alertas inteligentes.', color: '#3b82f6' },
            { icon: Users, title: 'Personas', desc: 'Registro de personas naturales y jurídicas con búsqueda por DNI/RUC y apoderados.', color: '#8b5cf6' },
            { icon: CalendarDays, title: 'Audiencias', desc: 'Programación de audiencias presenciales y virtuales con registro de resultados.', color: '#f59e0b' },
            { icon: FileText, title: 'Documentos', desc: 'Generación automática de Actas, Esquelas, Invitaciones y más formatos legales.', color: '#10b981' },
            { icon: BarChart3, title: 'Reportes', desc: 'Estadísticas, indicadores y exportación a Excel y PDF con filtros por fecha.', color: '#ec4899' },
            { icon: Shield, title: 'Seguridad', desc: 'Control de acceso por roles con autenticación JWT y notificaciones en tiempo real.', color: '#06b6d4' },
          ].map((f, i) => (
            <div key={i} className="home-feature-card" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
              <div className="home-feature-icon" style={{ background: `${f.color}15`, color: f.color }}>
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="home-cta-bg" />
        <h2>¿Listo para comenzar?</h2>
        <p>Inicie sesión para acceder al panel de control y gestionar sus conciliaciones.</p>
        <Link to="/login" className="home-cta-primary">
          Acceder al Sistema <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} SBSS - Sistema de Gestión de Conciliaciones. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
