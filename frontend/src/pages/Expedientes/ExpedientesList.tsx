import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { expedienteApi } from '../../api/axios';
import { Plus, Search, AlertTriangle, Clock, Eye } from 'lucide-react';

const estadoColors: Record<string, string> = {
  REGISTRADO: '#3b82f6', 'EN PROCESO': '#f59e0b', 'AUDIENCIA PROGRAMADA': '#8b5cf6',
  CONCILIADO: '#10b981', 'NO CONCILIADO': '#6b7280', CERRADO: '#1f2937', VENCIDO: '#ef4444',
};

const alertaColors: Record<string, string> = {
  NORMAL: '#10b981', ADVERTENCIA: '#f59e0b', CRITICO: '#ef4444', VENCIDO: '#dc2626',
};

export default function ExpedientesList() {
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    expedienteApi.list().then(r => setExpedientes(r.data));
  }, []);

  const filtered = filter
    ? expedientes.filter(e =>
        e.numero_expediente.toLowerCase().includes(filter.toLowerCase()) ||
        (e.nombre_materia || '').toLowerCase().includes(filter.toLowerCase()) ||
        (e.nombre_sede || '').toLowerCase().includes(filter.toLowerCase()) ||
        (e.nombre_conciliador || '').toLowerCase().includes(filter.toLowerCase()) ||
        e.estado.toLowerCase().includes(filter.toLowerCase()))
    : expedientes;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Expedientes</h1>
        <Link to="/expedientes/nuevo" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] no-underline">
          <Plus size={18} /> Nuevo Expediente
        </Link>
      </div>

      <div className="flex items-center gap-2.5 bg-white dark:bg-[#1a1d27] border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 mb-4 text-slate-400 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar por número de expediente..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400"
        />
      </div>

      <div className="bg-white dark:bg-[#1a1d27] rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Número</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Materia</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Sede</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Conciliador</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Alerta</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Creación</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800"><strong className="text-slate-800 dark:text-slate-200">{e.numero_expediente}</strong></td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{e.nombre_materia}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{e.nombre_sede}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: estadoColors[e.estado] || '#6b7280' }}>
                    {e.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{e.nombre_conciliador || '-'}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: alertaColors[e.alerta_vencimiento] || '#10b981' }}>
                    {e.alerta_vencimiento === 'ADVERTENCIA' || e.alerta_vencimiento === 'CRITICO' ? (
                      <AlertTriangle size={14} />
                    ) : e.alerta_vencimiento === 'VENCIDO' ? (
                      <Clock size={14} />
                    ) : null}
                    {e.alerta_vencimiento}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{new Date(e.fecha_creacion).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800">
                  <Link to={`/expedientes/${e.id}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all no-underline"><Eye size={16} /> Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
