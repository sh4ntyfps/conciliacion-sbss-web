import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { personaApi, ubigeoApi } from '../../api/axios';
import { User, Building2, Save, X } from 'lucide-react';

export default function PersonaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [tipo, setTipo] = useState<'Natural' | 'Juridica'>('Natural');
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [distritos, setDistritos] = useState<any[]>([]);

  useEffect(() => { ubigeoApi.departamentos().then(r => setDepartamentos(r.data)); }, []);

  const [form, setForm] = useState<any>({
    nombres: '', apellidos: '', dni: '', telefono: '', email: '', direccion: '',
    razonSocial: '', ruc: '', departamentoId: '', provinciaId: '', distritoId: '',
    apoderadoNombres: '', apoderadoApellidos: '', apoderadoDni: '', apoderadoTelefono: '',
    representanteNombres: '', representanteApellidos: '', representanteDni: '', cargo: '',
  });

  useEffect(() => {
    if (!id) return;
    personaApi.get(Number(id)).then(r => {
      const p = r.data;
      setTipo(p.tipo_persona);
      setForm({
        nombres: p.nombres || '', apellidos: p.apellidos || '', dni: p.dni || '',
        telefono: p.telefono || '', email: p.email || '', direccion: p.direccion || '',
        razonSocial: p.razon_social || '', ruc: p.ruc || '',
        departamentoId: p.departamento_id?.toString() || '',
        provinciaId: p.provincia_id?.toString() || '',
        distritoId: p.distrito_id?.toString() || '',
        apoderadoNombres: p.apoderado_nombres || '', apoderadoApellidos: p.apoderado_apellidos || '',
        apoderadoDni: p.apoderado_dni || '', apoderadoTelefono: p.apoderado_telefono || '',
        representanteNombres: p.representante_nombres || '', representanteApellidos: p.representante_apellidos || '',
        representanteDni: p.representante_dni || '', cargo: p.cargo || '',
      });
      if (p.departamento_id) {
        ubigeoApi.provincias(p.departamento_id).then(res => setProvincias(res.data));
      }
      if (p.provincia_id) {
        ubigeoApi.distritos(p.provincia_id).then(res => setDistritos(res.data));
      }
    });
  }, [id]);

  const loadProvincias = async (depId: number) => {
    setForm((f: any) => ({ ...f, departamentoId: depId.toString(), provinciaId: '', distritoId: '' }));
    const r = await ubigeoApi.provincias(depId);
    setProvincias(r.data);
  };

  const loadDistritos = async (provId: number) => {
    setForm((f: any) => ({ ...f, provinciaId: provId.toString(), distritoId: '' }));
    const r = await ubigeoApi.distritos(provId);
    setDistritos(r.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await personaApi.update(Number(id), {
          tipo_persona: tipo,
          nombres: form.nombres, apellidos: form.apellidos, dni: form.dni,
          razon_social: form.razonSocial, ruc: form.ruc,
          telefono: form.telefono, email: form.email, direccion: form.direccion,
          distritoId: form.distritoId || null,
        });
        navigate('/personas');
        return;
      }

      let apoderadoId, representanteId;

      if (tipo === 'Natural' && form.apoderadoDni) {
        const a = await personaApi.createApoderado({
          nombres: form.apoderadoNombres, apellidos: form.apoderadoApellidos,
          dni: form.apoderadoDni, telefono: form.apoderadoTelefono,
        });
        apoderadoId = a.data.id;
      }

      if (tipo === 'Juridica' && form.representanteDni) {
        const r = await personaApi.createRepresentante({
          nombres: form.representanteNombres, apellidos: form.representanteApellidos,
          dni: form.representanteDni, cargo: form.cargo,
        });
        representanteId = r.data.id;
      }

      if (tipo === 'Natural') {
        await personaApi.createNatural({
          nombres: form.nombres, apellidos: form.apellidos, dni: form.dni,
          telefono: form.telefono, email: form.email, direccion: form.direccion,
          distritoId: form.distritoId || null, apoderadoId: apoderadoId || null,
        });
      } else {
        await personaApi.createJuridica({
          razonSocial: form.razonSocial, ruc: form.ruc,
          telefono: form.telefono, email: form.email, direccion: form.direccion,
          distritoId: form.distritoId || null, representanteId: representanteId || null,
        });
      }
      navigate('/personas');
    } catch (err) {
      console.error(err);
      alert(isEdit ? 'Error al actualizar persona' : 'Error al crear persona');
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{isEdit ? 'Editar Persona' : 'Nueva Persona'}</h1>
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit mt-4">
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none ${tipo === 'Natural' ? 'bg-white dark:bg-[#1a1d27] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'}`} onClick={() => setTipo('Natural')}><User size={18} /> Persona Natural</button>
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none ${tipo === 'Juridica' ? 'bg-white dark:bg-[#1a1d27] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'}`} onClick={() => setTipo('Juridica')}><Building2 size={18} /> Persona Jurídica</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 16 }}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Datos {tipo === 'Natural' ? 'Personales' : 'de la Empresa'}</h2>
          <div className="grid grid-cols-2 gap-4">
            {tipo === 'Natural' ? (
              <>
                <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nombres</label><input value={form.nombres} onChange={e => setForm((f: any) => ({ ...f, nombres: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
                <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Apellidos</label><input value={form.apellidos} onChange={e => setForm((f: any) => ({ ...f, apellidos: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
                <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">DNI</label><input value={form.dni} onChange={e => setForm((f: any) => ({ ...f, dni: e.target.value }))} required maxLength={8} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
              </>
            ) : (
              <>
                <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Razón Social</label><input value={form.razonSocial} onChange={e => setForm((f: any) => ({ ...f, razonSocial: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
                <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">RUC</label><input value={form.ruc} onChange={e => setForm((f: any) => ({ ...f, ruc: e.target.value }))} required maxLength={11} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
              </>
            )}
            <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Teléfono</label><input value={form.telefono} onChange={e => setForm((f: any) => ({ ...f, telefono: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
            <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email</label><input type="email" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
            <div className="mb-4" style={{ gridColumn: '1 / -1' }}><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Dirección</label><input value={form.direccion} onChange={e => setForm((f: any) => ({ ...f, direccion: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 12 }}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Ubicación</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Departamento</label>
              <select value={form.departamentoId} onChange={e => loadProvincias(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer">
                <option value="">Seleccione...</option>
                {departamentos.map((d: any) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Provincia</label>
              <select value={form.provinciaId} onChange={e => loadDistritos(Number(e.target.value))} disabled={!form.departamentoId} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer disabled:opacity-50">
                <option value="">Seleccione...</option>
                {provincias.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Distrito</label>
              <select value={form.distritoId} onChange={e => setForm((f: any) => ({ ...f, distritoId: e.target.value }))} disabled={!form.provinciaId} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer disabled:opacity-50">
                <option value="">Seleccione...</option>
                {distritos.map((d: any) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>

        {tipo === 'Natural' && (
          <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 12 }}>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Apoderado (opcional)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nombres</label><input value={form.apoderadoNombres} onChange={e => setForm((f: any) => ({ ...f, apoderadoNombres: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
              <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Apellidos</label><input value={form.apoderadoApellidos} onChange={e => setForm((f: any) => ({ ...f, apoderadoApellidos: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
              <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">DNI</label><input value={form.apoderadoDni} onChange={e => setForm((f: any) => ({ ...f, apoderadoDni: e.target.value }))} maxLength={8} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
              <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Teléfono</label><input value={form.apoderadoTelefono} onChange={e => setForm((f: any) => ({ ...f, apoderadoTelefono: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
            </div>
          </div>
        )}

        {tipo === 'Juridica' && (
          <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 12 }}>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Representante Legal (opcional)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nombres</label><input value={form.representanteNombres} onChange={e => setForm((f: any) => ({ ...f, representanteNombres: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
              <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Apellidos</label><input value={form.representanteApellidos} onChange={e => setForm((f: any) => ({ ...f, representanteApellidos: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
              <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">DNI</label><input value={form.representanteDni} onChange={e => setForm((f: any) => ({ ...f, representanteDni: e.target.value }))} maxLength={8} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
              <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Cargo</label><input value={form.cargo} onChange={e => setForm((f: any) => ({ ...f, cargo: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" /></div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none"><Save size={18} /> {isEdit ? 'Actualizar Persona' : 'Guardar Persona'}</button>
          <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer border-none" onClick={() => navigate('/personas')}><X size={18} /> Cancelar</button>
        </div>
      </form>
    </div>
  );
}
