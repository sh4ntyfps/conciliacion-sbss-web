import { useEffect, useState } from 'react';
import { expedienteApi, audienciaApi } from '../../api/axios';
import { CalendarDays, Plus, CalendarPlus, Check, CheckCheck, X, UserX, PauseCircle } from 'lucide-react';

export default function AudienciasPage() {
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [expId, setExpId] = useState('');
  const [audiencias, setAudiencias] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fecha: '', modalidad: 'Presencial', observaciones: '' });
  const [expName, setExpName] = useState('');

  useEffect(() => {
    expedienteApi.list().then(r => setExpedientes(r.data));
  }, []);

  const loadAudiencias = (id: string) => {
    setExpId(id);
    if (id) {
      audienciaApi.porExpediente(Number(id)).then(r => setAudiencias(r.data));
      const exp = expedientes.find(e => e.id === Number(id));
      if (exp) setExpName(`${exp.numero_expediente} - ${exp.nombre_materia}`);
    } else {
      setAudiencias([]);
      setExpName('');
    }
  };

  const createAudiencia = async (e: React.FormEvent) => {
    e.preventDefault();
    await audienciaApi.create({ expedienteId: Number(expId), fecha: form.fecha, modalidad: form.modalidad });
    setShowForm(false);
    setForm({ fecha: '', modalidad: 'Presencial', observaciones: '' });
    loadAudiencias(expId);
    expedienteApi.list().then(r => setExpedientes(r.data));
  };

  const registrarResultado = async (audienciaId: number, resultado: string) => {
    await audienciaApi.registrarResultado(audienciaId, { expedienteId: Number(expId), resultado });
    loadAudiencias(expId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Audiencias</h1>
      </div>

      <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="mb-4" style={{ flex: 1, minWidth: 250 }}>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Expediente</label>
            <select value={expId} onChange={e => loadAudiencias(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer">
              <option value="">Seleccione un expediente...</option>
              {expedientes.map(e => (
                <option key={e.id} value={e.id}>{e.numero_expediente} - {e.nombre_materia} ({e.nombre_conciliador || 'Sin conciliador'})</option>
              ))}
            </select>
          </div>
          {expId && (
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none" style={{ marginBottom: 16 }} onClick={() => setShowForm(!showForm)}>
              <Plus size={18} /> {showForm ? 'Cancelar' : 'Nueva Audiencia'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 12 }}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Programar Audiencia para {expName}</h2>
          <form onSubmit={createAudiencia}>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Fecha y Hora *</label>
                <input type="datetime-local" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Modalidad *</label>
                <select value={form.modalidad} onChange={e => setForm(f => ({ ...f, modalidad: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer">
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>
              <div className="mb-4" style={{ gridColumn: '1 / -1' }}>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all" />
              </div>
            </div>
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none" style={{ marginTop: 8 }}><CalendarPlus size={18} /> Programar Audiencia</button>
          </form>
        </div>
      )}

      {audiencias.length > 0 && (
        <div className="bg-white dark:bg-[#1a1d27] rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-sm" style={{ marginTop: 16 }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50"><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Fecha</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Modalidad</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Resultado</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Estado</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Observaciones</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700"></th></tr>
            </thead>
            <tbody>
              {audiencias.map(a => (
                <tr key={a.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{new Date(a.fecha).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: a.modalidad === 'Presencial' ? '#3b82f6' : '#8b5cf6' }}>{a.modalidad}</span></td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{a.resultado || <span className="text-slate-400 dark:text-slate-500 italic">Pendiente</span>}</td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: a.estado === 'PROGRAMADA' ? '#f59e0b' : a.estado === 'REALIZADA' ? '#10b981' : '#ef4444' }}>{a.estado}</span></td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{a.observaciones || '-'}</td>
                  <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800">
                    {a.estado === 'PROGRAMADA' && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {['Acuerdo Total', 'Acuerdo Parcial', 'Falta de Acuerdo', 'Inasistencia', 'Suspension'].map(r => (
                          <button key={r} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-white text-xs font-medium transition-all cursor-pointer border-none hover:opacity-90" onClick={() => registrarResultado(a.id, r)} style={{
                            background: r.includes('Acuerdo') ? '#10b981' : r === 'Suspension' ? '#f59e0b' : '#6b7280',
                          }}>
                            {r === 'Acuerdo Total' ? <Check size={16} /> : r === 'Acuerdo Parcial' ? <CheckCheck size={16} /> : r === 'Falta de Acuerdo' ? <X size={16} /> : r === 'Inasistencia' ? <UserX size={16} /> : <PauseCircle size={16} />} {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!expId && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400" style={{ marginTop: 24 }}>
          <CalendarDays size={48} className="text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm">Seleccione un expediente para ver y gestionar sus audiencias</p>
        </div>
      )}

      {expId && audiencias.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400" style={{ marginTop: 24 }}>
          <CalendarDays size={48} className="text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm">Este expediente no tiene audiencias registradas. Haga clic en "Nueva Audiencia" para programar una.</p>
        </div>
      )}
    </div>
  );
}
