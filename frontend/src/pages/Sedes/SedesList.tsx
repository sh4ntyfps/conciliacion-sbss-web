import { useEffect, useState } from 'react';
import { sedeApi } from '../../api/axios';
import { Plus, Building2, Edit2, X, ToggleLeft, ToggleRight, ArrowLeft, Save } from 'lucide-react';

export default function SedesList() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ nombre: '', direccion: '', telefono: '' });

  useEffect(() => { sedeApi.list().then(r => setSedes(r.data)); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ nombre: '', direccion: '', telefono: '' });
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ nombre: s.nombre, direccion: s.direccion || '', telefono: s.telefono || '' });
    setShowModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await sedeApi.update(editing.id, form);
    } else {
      await sedeApi.create(form);
    }
    setShowModal(false);
    sedeApi.list().then(r => setSedes(r.data));
  };

  const toggle = async (id: number, activo: boolean) => {
    if (!confirm(`¿Está seguro de ${activo ? 'desactivar' : 'activar'} esta sede?`)) return;
    await sedeApi.toggle(id);
    sedeApi.list().then(r => setSedes(r.data));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sedes</h1>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none" onClick={openNew}><Plus size={18} /> Nueva Sede</button>
      </div>

      {sedes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Building2 size={48} className="text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm">No hay sedes registradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sedes.map(s => (
            <div key={s.id} className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200" style={{ position: 'relative' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{s.nombre}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.direccion || 'Sin dirección'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.telefono || ''}</p>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white`} style={{ backgroundColor: s.activo ? '#10b981' : '#ef4444' }}>
                    {s.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all cursor-pointer border-none" onClick={() => openEdit(s)}><Edit2 size={14} /></button>
                  <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all cursor-pointer border-none" onClick={() => toggle(s.id, s.activo)}>
                    {s.activo ? <><ToggleLeft size={16} /> Desactivar</> : <><ToggleRight size={16} /> Activar</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl p-7 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{editing ? 'Editar Sede' : 'Nueva Sede'}</h2>
              <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border-none" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={save}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required placeholder="Nombre de la sede" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Dirección</label>
                <input value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} placeholder="Dirección" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Teléfono</label>
                <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="Teléfono" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer border-none" onClick={() => setShowModal(false)}><ArrowLeft size={18} /> Cancelar</button>
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none"><Save size={18} /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
