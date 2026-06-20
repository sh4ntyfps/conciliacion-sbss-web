import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { personaApi, ubigeoApi } from '../../api/axios';
import { User, Building2, Pencil, ArrowLeft, Mail, Phone, MapPin, UserCircle } from 'lucide-react';

export default function PersonaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<any>(null);
  const [distrito, setDistrito] = useState('');

  useEffect(() => {
    if (!id) return;
    personaApi.get(Number(id)).then(async (r) => {
      const p = r.data;
      setPersona(p);
      if (p.distrito_id) {
        const distRes = await ubigeoApi.distritos(p.provincia_id || 0);
        const d = distRes.data.find((d: any) => d.id === p.distrito_id);
        if (d) setDistrito(d.nombre);
      }
    });
  }, [id]);

  if (!persona) return <div className="loading-screen">Cargando...</div>;

  const isNatural = persona.tipo_persona === 'Natural';

  return (
    <div className="page-enter">
      <Link to="/personas" className="back-link">
        <ArrowLeft size={16} /> Volver a Personas
      </Link>

      <div className="page-header">
        <h1>{isNatural ? `${persona.nombres} ${persona.apellidos}` : persona.razon_social}</h1>
        <button onClick={() => navigate(`/personas/${id}`)} className="btn btn-primary">
          <Pencil size={18} /> Editar
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="profile-header">
            <div className="profile-avatar">
              {isNatural ? <User size={28} /> : <Building2 size={28} />}
            </div>
            <div>
              <h3>Información General</h3>
              <span className="badge" style={{ background: isNatural ? '#3b82f6' : '#8b5cf6', fontSize: '0.7rem' }}>
                {isNatural ? 'Persona Natural' : 'Persona Jurídica'}
              </span>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            {isNatural ? (
              <>
                <div className="detail-row"><label>Nombres</label><span>{persona.nombres}</span></div>
                <div className="detail-row"><label>Apellidos</label><span>{persona.apellidos}</span></div>
                <div className="detail-row"><label>DNI</label><span>{persona.dni}</span></div>
              </>
            ) : (
              <>
                <div className="detail-row"><label>Razón Social</label><span>{persona.razon_social}</span></div>
                <div className="detail-row"><label>RUC</label><span>{persona.ruc}</span></div>
              </>
            )}
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="profile-header">
            <div className="profile-avatar" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
              <MapPin size={28} />
            </div>
            <div>
              <h3>Contacto y Ubicación</h3>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="detail-row"><label><Mail size={14} /> Email</label><span>{persona.email || '-'}</span></div>
            <div className="detail-row"><label><Phone size={14} /> Teléfono</label><span>{persona.telefono || '-'}</span></div>
            <div className="detail-row"><label><MapPin size={14} /> Dirección</label><span>{persona.direccion || '-'}</span></div>
            <div className="detail-row"><label>Distrito</label><span>{distrito || '-'}</span></div>
          </div>
        </div>
      </div>

      {(isNatural && persona.apoderado_nombres) || (!isNatural && persona.representante_nombres) ? (
        <div className="stat-card" style={{ marginTop: 16, borderLeftColor: '#f59e0b' }}>
          <div className="profile-header">
            <div className="profile-avatar" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
              <UserCircle size={28} />
            </div>
            <div>
              <h3>{isNatural ? 'Apoderado' : 'Representante Legal'}</h3>
            </div>
          </div>
          <div style={{ marginTop: 16 }} className="detail-grid">
            {isNatural ? (
              <>
                <div className="detail-row"><label>Nombres</label><span>{persona.apoderado_nombres}</span></div>
                <div className="detail-row"><label>Apellidos</label><span>{persona.apoderado_apellidos}</span></div>
                <div className="detail-row"><label>DNI</label><span>{persona.apoderado_dni}</span></div>
                <div className="detail-row"><label>Teléfono</label><span>{persona.apoderado_telefono || '-'}</span></div>
              </>
            ) : (
              <>
                <div className="detail-row"><label>Nombres</label><span>{persona.representante_nombres}</span></div>
                <div className="detail-row"><label>Apellidos</label><span>{persona.representante_apellidos}</span></div>
                <div className="detail-row"><label>DNI</label><span>{persona.representante_dni}</span></div>
                <div className="detail-row"><label>Cargo</label><span>{persona.cargo || '-'}</span></div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
