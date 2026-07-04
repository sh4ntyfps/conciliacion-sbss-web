import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, FileText, CheckCircle, XCircle, Clock, Archive, ChevronDown, Eye, Gavel } from 'lucide-react';

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (value === display) return;
    const start = performance.now();
    const from = prev.current;
    prev.current = value;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value, duration]);
  return <>{display}</>;
}

const estadoColors: Record<string, string> = {
  REGISTRADO: '#3b82f6', 'EN PROCESO': '#f59e0b', 'AUDIENCIA PROGRAMADA': '#8b5cf6',
  CONCILIADO: '#10b981', 'NO CONCILIADO': '#6b7280', CERRADO: '#1f2937', VENCIDO: '#ef4444',
};

const alertaColors: Record<string, string> = {
  NORMAL: '#10b981', ADVERTENCIA: '#f59e0b', CRITICO: '#ef4444', VENCIDO: '#dc2626',
};

const alertaLabels: Record<string, string> = {
  NORMAL: 'Normal', ADVERTENCIA: 'Próximo a Vencer', CRITICO: 'Vencido', VENCIDO: 'Vencido',
};

const estadoCategorias: Record<string, string[]> = {
  'Total Expedientes': ['REGISTRADO', 'EN PROCESO', 'AUDIENCIA PROGRAMADA', 'CONCILIADO', 'NO CONCILIADO', 'CERRADO', 'VENCIDO'],
  'En Proceso': ['EN PROCESO'],
  Pendientes: ['REGISTRADO'],
  Conciliados: ['CONCILIADO'],
  'No Conciliados': ['NO CONCILIADO'],
  Cerrados: ['CERRADO', 'VENCIDO'],
};

function MiniExpedienteCard({ e }: { e: any }) {
  const fecha = new Date(e.fecha_creacion);
  const fechaStr = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const tieneAlerta = e.alerta_vencimiento === 'ADVERTENCIA' || e.alerta_vencimiento === 'CRITICO' || e.alerta_vencimiento === 'VENCIDO';

  return (
    <Link to={`/expedientes/${e.id}`} className="block no-underline group">
      <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-[#1a1d27] hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-200">
        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
          <Gavel size={16} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{e.numero_expediente}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: estadoColors[e.estado] || '#6b7280' }}>
              {e.estado}
            </span>
            {tieneAlerta && e.dias_restantes != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: alertaColors[e.alerta_vencimiento] || '#10b981' }}>
                {alertaLabels[e.alerta_vencimiento] || e.alerta_vencimiento} {e.alerta_vencimiento === 'CRITICO' || e.alerta_vencimiento === 'VENCIDO' ? '' : `(Día ${e.dias_restantes})`}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {e.nombre_materia} <span className="text-slate-300 dark:text-slate-600">·</span> {e.nombre_sede}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>Conciliador: {e.nombre_conciliador || '—'}</span>
            <span>Creación: {fechaStr}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-blue-500 text-xs font-semibold flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          Ver <Eye size={14} />
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [indicadores, setIndicadores] = useState<any>({});
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any>({ total: 0, alerts: [] });
  const [expedientesPorEstado, setExpedientesPorEstado] = useState<any>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.allSettled([
      dashboardApi.indicadores().then(r => setIndicadores(r.data)),
      dashboardApi.trimestres({ anio: new Date().getFullYear() }).then(r => setTrimestres(r.data)),
      dashboardApi.alertas().then(r => setAlertas(r.data)),
      dashboardApi.expedientesPorEstado().then(r => setExpedientesPorEstado(r.data)),
    ]).then(results => {
      const rejected = results.filter(r => r.status === 'rejected');
      if (rejected.length > 0) setError('Error al cargar algunos indicadores');
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Expedientes', value: indicadores.total_expedientes ?? 0, icon: FileText, color: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
    { label: 'En Proceso', value: indicadores.en_proceso ?? 0, icon: Clock, color: '#f59e0b', gradient: 'from-amber-500 to-amber-600' },
    { label: 'Pendientes', value: indicadores.pendientes ?? 0, icon: AlertTriangle, color: '#ef4444', gradient: 'from-red-500 to-red-600' },
    { label: 'Conciliados', value: indicadores.conciliados ?? 0, icon: CheckCircle, color: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'No Conciliados', value: indicadores.no_conciliados ?? 0, icon: XCircle, color: '#6b7280', gradient: 'from-gray-500 to-gray-600' },
    { label: 'Cerrados', value: (indicadores.cerrados ?? 0) + (indicadores.vencidos ?? 0), icon: Archive, color: '#8b5cf6', gradient: 'from-violet-500 to-violet-600' },
  ];

  const trimestresData = [1, 2, 3, 4].map(t => ({
    trimestre: `T${t}`,
    total: parseInt(trimestres.find((r: any) => parseInt(r.trimestre) === t)?.total || '0'),
  }));

  const toggleCard = (label: string) => {
    setExpandedCard(prev => prev === label ? null : label);
  };

  const totalActivos = (indicadores.en_proceso ?? 0) + (indicadores.pendientes ?? 0) + (indicadores.audiencia_programada ?? 0);
  const totalResueltos = (indicadores.conciliados ?? 0) + (indicadores.no_conciliados ?? 0) + (indicadores.cerrados ?? 0);

  if (loading) {
    return (
      <div className="page-enter">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          {cards.map(c => (
            <div key={c.label} className="bg-white dark:bg-[#1a1d27] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500/50 to-transparent animate-pulse" />
              <div className="p-5 animate-pulse">
                <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 mb-3" />
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Panel de control del centro de conciliación</p>
        </div>
        <div className="flex gap-3 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {totalActivos} activos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            {totalResueltos} resueltos
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-800/30 animate-slideDown">
          {error}
        </div>
      )}

      {alertas.total > 0 && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 text-amber-700 dark:text-amber-400 text-sm font-medium border border-amber-200 dark:border-amber-800/30 animate-slideDown shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <span className="font-semibold">{alertas.total} expediente(s) próximos a vencer</span>
            <span className="ml-2 opacity-70 font-normal">— Revisar antes del plazo de 10 días</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <div key={c.label}
            className="bg-white dark:bg-[#1a1d27] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 overflow-hidden cursor-pointer"
            style={{ animation: `slideUp 0.4s ease ${i * 0.06}s backwards` }}
            onClick={() => toggleCard(c.label)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleCard(c.label); }}>
            <div className="h-1.5 bg-gradient-to-r" style={{ background: `linear-gradient(90deg, ${c.color}88, ${c.color}33)` }} />
            <div className="p-5 flex flex-col items-center text-center relative">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 relative transition-transform duration-300"
                style={{ backgroundColor: `${c.color}15`, color: c.color }}>
                <c.icon size={22} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                <AnimatedNumber value={c.value} />
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-tight text-balance">{c.label}</p>
              <div className="mt-2 text-slate-300 dark:text-slate-600 transition-transform duration-200" style={{ transform: expandedCard === c.label ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {expandedCard && (
        <div className="mt-4 animate-slideDown">
          <div className="bg-white dark:bg-[#1a1d27] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {expandedCard} — Últimos expedientes
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {estadoCategorias[expandedCard]?.flatMap(est => expedientesPorEstado[est] || []).length > 0 ? (
                estadoCategorias[expandedCard]?.flatMap(est => (expedientesPorEstado[est] || []).map((e: any) => (
                  <MiniExpedienteCard key={e.id} e={e} />
                )))
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No hay expedientes en esta categoría</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1d27] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Expedientes por Trimestre</h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">{new Date().getFullYear()}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trimestresData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="trimestre" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px', border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '8px 12px',
                }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {trimestresData.map((_, idx) => (
                  <rect key={idx} fill={`url(#barGrad${idx})`} />
                ))}
              </Bar>
              <defs>
                {trimestresData.map((_, idx) => (
                  <linearGradient key={idx} id={`barGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Resumen</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">{indicadores.total_expedientes ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
              <span className="text-sm text-slate-600 dark:text-slate-400">Conciliados</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{indicadores.conciliados ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
              <span className="text-sm text-slate-600 dark:text-slate-400">No Conciliados</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums">{indicadores.no_conciliados ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
              <span className="text-sm text-slate-600 dark:text-slate-400">Vencidos</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">{indicadores.vencidos ?? 0}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50 dark:bg-violet-900/10">
                <span className="text-sm text-slate-600 dark:text-slate-400">Efectividad</span>
                <span className="text-lg font-bold text-violet-600 dark:text-violet-400 tabular-nums">
                  {((indicadores.conciliados ?? 0) / Math.max((indicadores.conciliados ?? 0) + (indicadores.no_conciliados ?? 0), 1)) * 100}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
