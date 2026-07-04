import { useState } from 'react';
import { reporteApi } from '../../api/axios';
import { FileSpreadsheet, FileText, Printer, Search, CalendarDays, FileBarChart, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Reportes() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reportes, setReportes] = useState<any[]>([]);

  const search = async () => {
    if (!fechaInicio || !fechaFin) return;
    const r = await reporteApi.list({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    setReportes(r.data);
  };

  const exportExcel = async () => {
    if (!fechaInicio || !fechaFin) return;
    const r = await reporteApi.excel({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Expedientes_${fechaInicio}_${fechaFin}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    if (!fechaInicio || !fechaFin) return;
    const r = await reporteApi.pdf({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Expedientes_${fechaInicio}_${fechaFin}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printTable = () => {
    if (reportes.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const safeText = (val: unknown) => {
      const text = String(val ?? '');
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    const rows = reportes.map(r => `
      <tr>
        <td>${safeText(r.numero_expediente)}</td>
        <td>${safeText(r.materia)}</td>
        <td>${safeText(r.tipo_materia)}</td>
        <td>${safeText(r.solicitante)}</td>
        <td>${safeText(r.invitado)}</td>
        <td>${safeText(r.conciliador)}</td>
        <td>${safeText(r.estado)}</td>
        <td>${safeText(r.dias_transcurridos)}</td>
        <td><span style="color:${r.alerta_vencimiento === 'VENCIDO' ? '#EF4444' : r.alerta_vencimiento === 'CRITICO' ? '#F59E0B' : '#10B981'}">${safeText(r.alerta_vencimiento)}</span></td>
        <td>${new Date(r.fecha_creacion).toLocaleDateString()}</td>
      </tr>
    `).join('');
    printWindow.document.body.innerHTML = `
      <html><head><title>Reporte de Expedientes</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; }
        h1 { color: #0f6ecd; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
        th { background: #0f6ecd; color: white; padding: 8px 6px; text-align: left; font-size: 11px; white-space: nowrap; }
        td { padding: 6px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f8fafc; }
        .header { display: flex; justify-content: space-between; align-items: center; }
        .fecha { color: #666; font-size: 0.85rem; }
        .resumen { margin: 16px 0; padding: 16px; background: #f0f4f8; border-radius: 8px; display: flex; gap: 24px; flex-wrap: wrap; }
        .resumen-item { text-align: center; }
        .resumen-item .num { font-size: 1.5rem; font-weight: 700; color: #0f6ecd; }
        .resumen-item .label { font-size: 0.75rem; color: #666; }
      </style></head><body>
      <div class="header">
        <h1>Reporte de Expedientes</h1>
        <p class="fecha">Período: ${safeText(fechaInicio)} al ${safeText(fechaFin)}</p>
      </div>
      <div class="resumen">
        <div class="resumen-item"><div class="num">${reportes.length}</div><div class="label">Total</div></div>
        <div class="resumen-item"><div class="num" style="color:#10b981">${reportes.filter(r => r.estado === 'CONCILIADO').length}</div><div class="label">Conciliados</div></div>
        <div class="resumen-item"><div class="num" style="color:#ef4444">${reportes.filter(r => r.estado === 'VENCIDO').length}</div><div class="label">Vencidos</div></div>
        <div class="resumen-item"><div class="num" style="color:#f59e0b">${reportes.filter(r => r.estado === 'EN PROCESO' || r.estado === 'REGISTRADO').length}</div><div class="label">Pendientes</div></div>
      </div>
      <table><thead><tr>
        <th>N° Exp.</th><th>Materia</th><th>Tipo</th><th>Solicitante</th><th>Invitado</th><th>Conciliador</th><th>Estado</th><th>Días</th><th>Alerta</th><th>F. Creación</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <p style="margin-top: 24px; color: #666; font-size: 0.8rem;">Generado el ${new Date().toLocaleString()}</p>
    `;
    printWindow.document.title = 'Reporte de Expedientes';
    setTimeout(() => printWindow.print(), 500);
  };

  const totalConciliados = reportes.filter(r => r.estado === 'CONCILIADO').length;
  const totalVencidos = reportes.filter(r => r.estado === 'VENCIDO').length;
  const totalPendientes = reportes.filter(r => ['REGISTRADO', 'EN PROCESO', 'AUDIENCIA PROGRAMADA'].includes(r.estado)).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <FileBarChart size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Reportes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestión de reportes de expedientes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays size={16} className="text-blue-500" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filtros de búsqueda</h2>
        </div>
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            onClick={search}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none"
          >
            <Search size={16} /> Buscar
          </button>
        </div>
      </div>

      {reportes.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <FileBarChart size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{reportes.length}</div>
            </div>
            <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conciliados</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalConciliados}</div>
              <p className="text-xs text-slate-400 mt-1">{reportes.length > 0 ? ((totalConciliados / reportes.length) * 100).toFixed(1) : 0}% del total</p>
            </div>
            <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vencidos</span>
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <XCircle size={16} className="text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalVencidos}</div>
              <p className="text-xs text-slate-400 mt-1">{reportes.length > 0 ? ((totalVencidos / reportes.length) * 100).toFixed(1) : 0}% del total</p>
            </div>
            <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pendientes</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalPendientes}</div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 mt-5 flex-wrap">
            <button onClick={exportExcel} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-sm hover:shadow-md hover:shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none">
              <FileSpreadsheet size={16} /> Excel
            </button>
            <button onClick={exportPdf} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 shadow-sm hover:shadow-md hover:shadow-rose-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none">
              <FileText size={16} /> PDF
            </button>
            <button onClick={printTable} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer border-none">
              <Printer size={16} /> Imprimir
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm mt-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700 whitespace-nowrap">N° Expediente</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Materia</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Tipo</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Solicitante</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Invitado</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Conciliador</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Estado</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Días</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Alerta</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">F. Creación</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map(r => (
                  <tr key={r.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{r.numero_expediente}</span>
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{r.materia}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{r.tipo_materia}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{r.solicitante || '-'}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{r.invitado || '-'}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{r.conciliador || '-'}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                        style={{
                          backgroundColor: r.estado === 'CONCILIADO' ? '#10b981' :
                            r.estado === 'VENCIDO' ? '#ef4444' :
                            r.estado === 'NO CONCILIADO' ? '#6b7280' :
                            r.estado === 'CERRADO' ? '#1f2937' :
                            r.estado === 'AUDIENCIA PROGRAMADA' ? '#8b5cf6' : '#3b82f6'
                        }}
                      >
                        {r.estado === 'AUDIENCIA PROGRAMADA' ? 'AUDIENCIA' : r.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{r.dias_transcurridos ?? '-'}</td>
                    <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: r.alerta_vencimiento === 'VENCIDO' ? '#fecaca' :
                            r.alerta_vencimiento === 'CRITICO' ? '#fef3c7' :
                            r.alerta_vencimiento === 'ADVERTENCIA' ? '#fef3c7' : '#d1fae5',
                          color: r.alerta_vencimiento === 'VENCIDO' ? '#7f1d1d' :
                            r.alerta_vencimiento === 'CRITICO' ? '#92400e' : '#065f46'
                        }}
                      >
                        {r.alerta_vencimiento === 'ADVERTENCIA' ? 'ADVERTENCIA' : r.alerta_vencimiento || 'NORMAL'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {new Date(r.fecha_creacion).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-500">
              <FileBarChart size={14} />
              <span><strong className="text-slate-700 dark:text-slate-300">{reportes.length}</strong> expediente(s) — Generado el {new Date().toLocaleString()}</span>
            </div>
          </div>
        </>
      )}

      {reportes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 mt-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <FileBarChart size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Seleccione un rango de fechas y haga clic en "Buscar"</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">para generar el reporte de expedientes</p>
        </div>
      )}
    </div>
  );
}
