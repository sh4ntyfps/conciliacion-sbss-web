import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { repositorioApi } from '../../api/axios';
import { Upload, FileText, Trash2 } from 'lucide-react';

export default function RepositorioPage() {
  const { id } = useParams();
  const [files, setFiles] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) repositorioApi.list(Number(id)).then(r => setFiles(r.data));
  }, [id]);

  const upload = async () => {
    if (!fileRef.current?.files?.[0] || !id) return;
    const fd = new FormData();
    fd.append('file', fileRef.current.files[0]);
    await repositorioApi.upload(Number(id), fd);
    repositorioApi.list(Number(id)).then(r => setFiles(r.data));
    fileRef.current.value = '';
  };

  const remove = async (fileId: number) => {
    if (!confirm('Eliminar archivo?')) return;
    await repositorioApi.delete(fileId);
    repositorioApi.list(Number(id!)).then(r => setFiles(r.data));
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">Repositorio de Archivos</h1>
      <div className="bg-white dark:bg-[#1a1d27] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800" style={{ marginTop: 16 }}>
        <div className="flex gap-4 items-end flex-wrap">
          <input type="file" ref={fileRef} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30" />
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none" onClick={upload}><Upload size={18} /> Subir</button>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1a1d27] rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-sm" style={{ marginTop: 16 }}>
        <table className="w-full border-collapse">
          <thead><tr className="bg-slate-50 dark:bg-slate-800/50"><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Archivo</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Tipo</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Tamaño</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700">Subido</th><th className="text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b-2 border-slate-200 dark:border-slate-700"></th></tr></thead>
          <tbody>
            {files.map(f => (
              <tr key={f.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800"><FileText size={16} className="inline-block text-slate-400 mr-1" /> {f.nombre_archivo}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{f.tipo_archivo}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{(f.tamanio / 1024).toFixed(1)} KB</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">{new Date(f.subido_en).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-800"><button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all cursor-pointer border-none" onClick={() => remove(f.id)}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
