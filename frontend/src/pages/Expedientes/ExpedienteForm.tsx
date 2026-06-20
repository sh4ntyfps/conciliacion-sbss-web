import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { expedienteApi, materiaApi, trabajadorApi, sedeApi, personaApi } from '../../api/axios';
import { Search, UserPlus, FilePlus, X } from 'lucide-react';

export default function ExpedienteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [sedes, setSedes] = useState<any[]>([]);
  const [tiposMateria, setTiposMateria] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [conciliadores, setConciliadores] = useState<any[]>([]);
  const [searchDoc, setSearchDoc] = useState('');
  const [personaFound, setPersonaFound] = useState<any>(null);
  const [partes, setPartes] = useState<{ personaId: number; nombre: string; tipo: string }[]>([]);
  const [numero, setNumero] = useState('');

  const [form, setForm] = useState({
    sedeId: '', materiaId: '', tipoMateriaId: '', secretariaId: '',
    conciliadorId: '', motivo: '', pretensiones: '',
  });

  useEffect(() => {
    sedeApi.list().then(r => setSedes(r.data));
    materiaApi.tipos().then(r => setTiposMateria(r.data));

    if (isEdit && id) {
      expedienteApi.get(Number(id)).then(r => {
        const e = r.data;
        setForm({
          sedeId: e.sede_id?.toString() || '',
          materiaId: e.materia_id?.toString() || '',
          tipoMateriaId: e.tipo_materia_id?.toString() || '',
          secretariaId: e.secretaria_id?.toString() || '',
          conciliadorId: e.conciliador_id?.toString() || '',
          motivo: e.motivo || '',
          pretensiones: e.pretensiones || '',
        });
        setNumero(e.numero_expediente || '');
        if (e.tipo_materia_id) {
          materiaApi.porTipo(e.tipo_materia_id).then(res => setMaterias(res.data));
        }
        if (e.sede_id) {
          trabajadorApi.conciliadoresPorSede(e.sede_id).then(res => setConciliadores(res.data));
        }
      });
    } else {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (usuario.sedeId) {
        setForm(f => ({ ...f, sedeId: usuario.sedeId }));
        expedienteApi.generarNumero(usuario.sedeId).then(r => setNumero(r.data.numero));
        trabajadorApi.conciliadoresPorSede(usuario.sedeId).then(r => setConciliadores(r.data));
      }
    }
  }, [id]);

  const loadMaterias = (tipoId: number) => {
    setForm(f => ({ ...f, tipoMateriaId: tipoId.toString(), materiaId: '' }));
    materiaApi.porTipo(tipoId).then(r => setMaterias(r.data));
  };

  const loadConciliadores = (sedeId: number) => {
    setForm(f => ({ ...f, sedeId: sedeId.toString(), conciliadorId: '' }));
    if (!isEdit) {
      expedienteApi.generarNumero(Number(sedeId)).then(r => setNumero(r.data.numero));
    }
    trabajadorApi.conciliadoresPorSede(Number(sedeId)).then(r => setConciliadores(r.data));
  };

  const searchPersona = async () => {
    if (!searchDoc) return;
    const r = await personaApi.buscarPorDocumento(searchDoc);
    if (r.data.length > 0) {
      setPersonaFound(r.data[0]);
    } else {
      alert('Persona no encontrada. Regístrela primero en Personas.');
    }
  };

  const addParte = (tipo: string) => {
    if (!personaFound) return;
    setPartes(p => [...p, { personaId: personaFound.id, nombre: personaFound.nombres ? `${personaFound.nombres} ${personaFound.apellidos}` : personaFound.razon_social, tipo }]);
    setPersonaFound(null);
    setSearchDoc('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) return;

    const res = await expedienteApi.create({
      materiaId: Number(form.materiaId),
      sedeId: Number(form.sedeId),
      secretariaId: Number(form.secretariaId) || JSON.parse(localStorage.getItem('usuario') || '{}').id,
      motivo: form.motivo,
      pretensiones: form.pretensiones,
    });
    const expedienteId = res.data.id;

    for (const parte of partes) {
      await expedienteApi.agregarParte(expedienteId, { personaId: parte.personaId, tipoParte: parte.tipo });
    }

    if (form.conciliadorId) {
      await expedienteApi.asignarConciliador(expedienteId, Number(form.conciliadorId));
    }

    navigate(`/expedientes/${expedienteId}`);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{isEdit ? 'Editar Expediente' : 'Nuevo Expediente'}</h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">N° {numero || 'Generando...'}</p>
      {isEdit && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-3 mt-3 text-sm text-amber-700 dark:text-amber-400">
          Este expediente fue creado previamente. Para realizar cambios, diríjase a la{' '}
          <Link to={`/expedientes/${id}`} className="text-blue-600 dark:text-blue-400 font-semibold underline">página de detalle del expediente</Link>.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 16 }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Sede</label>
              <select value={form.sedeId} onChange={e => loadConciliadores(Number(e.target.value))} required disabled={isEdit} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">Seleccione...</option>
                {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Tipo de Materia</label>
              <select value={form.tipoMateriaId} onChange={e => loadMaterias(Number(e.target.value))} required disabled={isEdit} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">Seleccione...</option>
                {tiposMateria.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Materia</label>
              <select value={form.materiaId} onChange={e => setForm(f => ({ ...f, materiaId: e.target.value }))} required disabled={isEdit} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">Seleccione...</option>
                {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Conciliador</label>
              <select value={form.conciliadorId} onChange={e => setForm(f => ({ ...f, conciliadorId: e.target.value }))} disabled={isEdit} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">Sin asignar</option>
                {conciliadores.map(c => <option key={c.id} value={c.id}>{c.nombres} {c.apellidos}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Motivo</label>
            <textarea value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} rows={3} disabled={isEdit} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Pretensiones</label>
            <textarea value={form.pretensiones} onChange={e => setForm(f => ({ ...f, pretensiones: e.target.value }))} rows={3} disabled={isEdit} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
          </div>
        </div>

        {!isEdit && (
          <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 16 }}>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Partes del Expediente</h2>
            <div className="flex gap-4 items-end flex-wrap">
              <div className="mb-4" style={{ flex: 1 }}>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Buscar persona por DNI/RUC</label>
                <input value={searchDoc} onChange={e => setSearchDoc(e.target.value)} placeholder="Ingrese DNI o RUC" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
              </div>
              <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none" style={{ marginBottom: 16 }}               onClick={searchPersona}>
                <Search size={18} /> Buscar
              </button>
            </div>
            {personaFound && (
              <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 8 }}>
                <p className="text-sm text-slate-800 dark:text-slate-200"><strong>{personaFound.nombres ? `${personaFound.nombres} ${personaFound.apellidos}` : personaFound.razon_social}</strong></p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="button" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white text-xs font-medium transition-all cursor-pointer border-none hover:opacity-90" style={{ background: '#10b981' }} onClick={() => addParte('Solicitante')}>
<UserPlus size={16} /> Agregar como Solicitante
                  </button>
                  <button type="button" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white text-xs font-medium transition-all cursor-pointer border-none hover:opacity-90" style={{ background: '#f59e0b' }} onClick={() => addParte('Invitado')}>
<UserPlus size={16} /> Agregar como Invitado
                  </button>
                </div>
              </div>
            )}
            {partes.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {partes.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: p.tipo === 'Solicitante' ? '#10b981' : '#f59e0b' }}>{p.tipo}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{p.nombre}</span>
                    <button type="button" className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all cursor-pointer border-none ml-auto" onClick={() => setPartes(partes.filter((_, j) => j !== i))}>X</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          {!isEdit && (
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none"><FilePlus size={18} /> Crear Expediente</button>
          )}
          <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer border-none" onClick={() => navigate('/expedientes')}><X size={18} /> Cancelar</button>
        </div>
      </form>
    </div>
  );
}
