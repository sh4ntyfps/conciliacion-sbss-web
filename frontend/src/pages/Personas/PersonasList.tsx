import { useEffect, useState } from 'react';
import { personaApi } from '../../api/axios';
import { Plus, Search, User, Building2, Pencil, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function PersonasList() {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  const loadPersonas = () => personaApi.list().then(r => setPersonas(r.data));

  useEffect(() => { loadPersonas(); }, []);

  const filtered = filter
    ? personas.filter(p =>
        (p.nombres || '').toLowerCase().includes(filter.toLowerCase()) ||
        (p.razon_social || '').toLowerCase().includes(filter.toLowerCase()) ||
        (p.dni || '').includes(filter) ||
        (p.ruc || '').includes(filter))
    : personas;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Personas</h1>
        <Link to="/personas/nueva" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] no-underline"><Plus size={18} /> Nueva Persona</Link>
      </div>
      <div className="flex items-center gap-2.5 bg-white dark:bg-[#1a1d27] border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 mb-4 text-slate-400 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all">
        <Search size={18} />
        <input type="text" placeholder="Buscar por nombre, DNI o RUC..." value={filter} onChange={e => setFilter(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400" />
      </div>
      <div className="bg-white dark:bg-[#1a1d27] rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50"><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Tipo</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Nombre/Razón Social</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Documento</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Teléfono</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Email</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700"></th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{p.tipo_persona === 'Natural' ? <User size={16} className="inline-block" /> : <Building2 size={16} className="inline-block" />} {p.tipo_persona}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{p.nombres ? `${p.nombres} ${p.apellidos}` : p.razon_social}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{p.dni || p.ruc}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{p.telefono || '-'}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{p.email || '-'}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => navigate(`/personas/${p.id}/detalle`)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer border-none"><Eye size={16} /> Ver</button>
                    <button onClick={() => navigate(`/personas/${p.id}`)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all cursor-pointer border-none"><Pencil size={16} /> Editar</button>
                    <button onClick={async () => { await personaApi.toggle(p.id); loadPersonas(); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border-none" style={{ backgroundColor: p.activo ? '#fef2f2' : '#f0fdf4', color: p.activo ? '#ef4444' : '#10b981' }}>{p.activo ? <><ToggleLeft size={16} /> Desactivar</> : <><ToggleRight size={16} /> Activar</>}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
