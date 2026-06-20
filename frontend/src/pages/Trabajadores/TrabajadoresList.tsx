import { useEffect, useState } from 'react';
import { trabajadorApi, sedeApi } from '../../api/axios';
import { Plus, Search, X, Pencil, ToggleLeft, ToggleRight, ArrowLeft, Save } from 'lucide-react';

export default function TrabajadoresList() {
  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState<any>(null);
  const [form, setForm] = useState({
    nombres: '', apellidos: '', dni: '', telefono: '', email: '',
    password: '123456', rol: 'Secretaria', sedeId: '', registroCivilComercial: '',
  });

  useEffect(() => {
    trabajadorApi.list().then(r => setTrabajadores(r.data));
    sedeApi.list().then(r => setSedes(r.data));
  }, []);

  const filtered = filter
    ? trabajadores.filter(t =>
        `${t.nombres} ${t.apellidos}`.toLowerCase().includes(filter.toLowerCase()) ||
        t.dni.includes(filter) || t.email.toLowerCase().includes(filter.toLowerCase()))
    : trabajadores;

  const openNew = () => {
    setEditingTrabajador(null);
    setForm({ nombres: '', apellidos: '', dni: '', telefono: '', email: '', password: '123456', rol: 'Secretaria', sedeId: '', registroCivilComercial: '' });
    setShowModal(true);
  };

  const openEdit = (t: any) => {
    setEditingTrabajador(t);
    setForm({
      nombres: t.nombres || '', apellidos: t.apellidos || '', dni: t.dni || '',
      telefono: t.telefono || '', email: t.email || '', password: '',
      rol: t.rol || 'Secretaria', sedeId: t.sede_id?.toString() || '',
      registroCivilComercial: t.registro_civil_comercial || '',
    });
    setShowModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTrabajador) {
        const payload: any = { ...form };
        if (!payload.password) delete payload.password;
        await trabajadorApi.update(editingTrabajador.id, {
          ...payload,
          sedeId: Number(form.sedeId),
        });
      } else {
        await trabajadorApi.create({
          ...form,
          sedeId: Number(form.sedeId),
        });
      }
      setShowModal(false);
      setEditingTrabajador(null);
      trabajadorApi.list().then(r => setTrabajadores(r.data));
    } catch (err) {
      alert('Error al guardar trabajador. Verifique que el email y DNI sean únicos.');
    }
  };

  const toggle = async (id: number) => {
    if (confirm('¿Desactivar/Activar este trabajador?')) {
      await trabajadorApi.toggle(id);
      trabajadorApi.list().then(r => setTrabajadores(r.data));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trabajadores</h1>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none" onClick={openNew}><Plus size={18} /> Nuevo Trabajador</button>
      </div>

      <div className="flex items-center gap-2.5 bg-white dark:bg-[#1a1d27] border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 mb-4 text-slate-400 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all">
        <Search size={18} />
        <input type="text" placeholder="Buscar por nombre, DNI o email..." value={filter} onChange={e => setFilter(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400" />
      </div>

      {trabajadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <p className="mt-3 text-sm">No hay trabajadores registrados</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1d27] rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50"><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Nombre</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">DNI</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Email</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Rol</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Sede</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Registro Civil</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700"></th></tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800"><strong className="text-slate-800 dark:text-slate-200">{t.nombres} {t.apellidos}</strong></td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{t.dni}</td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{t.email}</td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{
                      backgroundColor: t.rol === 'Administrador' ? '#ef4444' : t.rol === 'Conciliador' ? '#f59e0b' : '#3b82f6'
                    }}>{t.rol}</span>
                  </td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{t.nombre_sede}</td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{t.registro_civil_comercial || '-'}</td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all cursor-pointer border-none" onClick={() => openEdit(t)}><Pencil size={16} /> Editar</button>
                      <button className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border-none ${t.activo ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'}`} onClick={() => toggle(t.id)}>
                        {t.activo ? <><ToggleLeft size={16} /> Desactivar</> : <><ToggleRight size={16} /> Activar</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => { setShowModal(false); setEditingTrabajador(null); }}>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl p-7 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{editingTrabajador ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h2>
              <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border-none" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={save}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nombres *</label>
                  <input value={form.nombres} onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Apellidos *</label>
                  <input value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">DNI *</label>
                  <input value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} required maxLength={8} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Contraseña *</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Rol *</label>
                  <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer">
                    <option value="Administrador">Administrador</option>
                    <option value="Conciliador">Conciliador</option>
                    <option value="Secretaria">Secretaria</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Sede *</label>
                  <select value={form.sedeId} onChange={e => setForm(f => ({ ...f, sedeId: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer">
                    <option value="">Seleccione...</option>
                    {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div className="mb-4" style={{ gridColumn: '1 / -1' }}>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Registro Civil / Comercial (solo Conciliadores)</label>
                  <input value={form.registroCivilComercial} onChange={e => setForm(f => ({ ...f, registroCivilComercial: e.target.value }))} placeholder="Ej: RC-001" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer border-none" onClick={() => { setShowModal(false); setEditingTrabajador(null); }}><ArrowLeft size={18} /> Cancelar</button>
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none"><Save size={18} /> {editingTrabajador ? 'Actualizar Trabajador' : 'Crear Trabajador'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
