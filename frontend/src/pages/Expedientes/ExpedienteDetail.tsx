import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { expedienteApi, audienciaApi, repositorioApi, trabajadorApi, personaApi, documentoApi, materiaApi, videoApi } from '../../api/axios';
import { UserPlus, Plus, RefreshCw, UserCheck, FileText, Download, Video, CheckCircle, XCircle, Upload } from 'lucide-react';

const ESTADOS = ['REGISTRADO', 'EN PROCESO', 'AUDIENCIA PROGRAMADA', 'CONCILIADO', 'NO CONCILIADO', 'CERRADO', 'VENCIDO'];

const TIPOS_DOCUMENTO = [
  'Acta de Conciliacion', 'Esquela de Designacion',
  'Invitacion a Conciliar', 'Pre Aviso', 'Constancia de Asistencia',
];

export default function ExpedienteDetail() {
  const { id } = useParams();
  const [exp, setExp] = useState<any>(null);
  const [partes, setPartes] = useState<any[]>([]);
  const [audiencias, setAudiencias] = useState<any[]>([]);
  const [repositorio, setRepositorio] = useState<any[]>([]);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [conciliadores, setConciliadores] = useState<any[]>([]);
  const [conciliadorSel, setConciliadorSel] = useState('');
  const [personas, setPersonas] = useState<any[]>([]);
  const [showAddParte, setShowAddParte] = useState(false);
  const [nuevaParte, setNuevaParte] = useState({ personaId: '', tipoParte: 'Solicitante' });

  const [documentos, setDocumentos] = useState<any[]>([]);
  const [tipoDocSel, setTipoDocSel] = useState(TIPOS_DOCUMENTO[0]);
  const [generando, setGenerando] = useState(false);
  const [msgDoc, setMsgDoc] = useState('');

  const [mesaPartes, setMesaPartes] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [tabActiva, setTabActiva] = useState<'info' | 'docs' | 'mesa' | 'videos'>('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    if (!id) return;
    setLoading(true);
    setError('');
    Promise.allSettled([
      expedienteApi.get(Number(id)).then(r => { setExp(r.data); setNuevoEstado(r.data.estado); }),
      expedienteApi.partes(Number(id)).then(r => setPartes(r.data)),
      audienciaApi.porExpediente(Number(id)).then(r => setAudiencias(r.data)),
      repositorioApi.list(Number(id)).then(r => setRepositorio(r.data)),
      documentoApi.porExpediente(Number(id)).then(r => setDocumentos(r.data)),
      expedienteApi.mesaPartes(Number(id)).then(r => setMesaPartes(r.data)),
      videoApi.list(Number(id)).then(r => setVideos(r.data)),
    ]).then(results => {
      const rejected = results.filter(r => r.status === 'rejected');
      if (rejected.length > 0) setError('Error al cargar algunas secciones');
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    if (!id) return;
    trabajadorApi.list().then(r => setConciliadores(r.data.filter((t: any) => t.rol === 'Conciliador')));
    personaApi.list().then(r => setPersonas(r.data));
    materiaApi.requisitos(Number(id)).then(r => {
      if (r.data.length > 0) setMesaPartes(r.data.map((req: any) => ({ requisito_id: req.id, nombre_doc: req.nombre_doc, obligatorio: req.obligatorio, presentado: false })));
    }).catch(() => {});
  }, [id]);

  const cambiarEstado = async () => {
    if (!id || !nuevoEstado) return;
    await expedienteApi.cambiarEstado(Number(id), nuevoEstado);
    loadData();
  };

  const asignarConciliador = async () => {
    if (!id || !conciliadorSel) return;
    await expedienteApi.asignarConciliador(Number(id), Number(conciliadorSel));
    setConciliadorSel('');
    loadData();
  };

  const agregarParte = async () => {
    if (!id || !nuevaParte.personaId) return;
    await expedienteApi.agregarParte(Number(id), { personaId: Number(nuevaParte.personaId), tipoParte: nuevaParte.tipoParte });
    setNuevaParte({ personaId: '', tipoParte: 'Solicitante' });
    setShowAddParte(false);
    loadData();
  };

  const generarDocumento = async () => {
    if (!id) return;
    setGenerando(true);
    setMsgDoc('');
    try {
      const res = await documentoApi.generar({ expedienteId: Number(id), tipoDocumento: tipoDocSel });
      setMsgDoc(`✅ ${res.data.message}`);
      loadData();
    } catch (err: any) {
      setMsgDoc(`❌ ${err.response?.data?.message || 'Error al generar documento'}`);
    } finally {
      setGenerando(false);
      setTimeout(() => setMsgDoc(''), 4000);
    }
  };

  const toggleMesaParte = async (reqId: number, presentado: boolean) => {
    if (!id) return;
    await expedienteApi.actualizarMesaPartes(Number(id), { requisitoId: reqId, presentado: !presentado });
    loadData();
  };

  const uploadVideo = async () => {
    if (!videoRef.current?.files?.[0] || !id) return;
    const fd = new FormData();
    fd.append('video', videoRef.current.files[0]);
    await videoApi.upload(Number(id), fd);
    videoRef.current.value = '';
    loadData();
  };

  const uploadFile = async () => {
    if (!fileRef.current?.files?.[0] || !id) return;
    const fd = new FormData();
    fd.append('file', fileRef.current.files[0]);
    await repositorioApi.upload(Number(id), fd);
    fileRef.current.value = '';
    loadData();
  };

  const downloadFile = async (doc: any) => {
    const ruta = doc.ruta_archivo || doc.ruta_video;
    if (!ruta) return;
    const fileName = ruta.split(/[/\\]/).pop();
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    window.open(`${baseUrl}/uploads/documentos/${fileName}`, '_blank');
  };

  if (loading && !exp) return <div className="flex items-center justify-center min-h-[50vh] text-slate-400 animate-pulse text-base">Cargando expediente...</div>;

  if (!exp && !loading) return <div className="flex items-center justify-center min-h-[50vh] text-red-500">Expediente no encontrado</div>;

  return (
    <div>
      <Link to="/expedientes" className="back-link">← Volver a Expedientes</Link>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-800/30">
          {error}
        </div>
      )}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1>{exp.numero_expediente}</h1>
          <span className="badge" style={{
            background: exp.estado === 'CONCILIADO' ? '#10b981' : exp.estado === 'NO CONCILIADO' || exp.estado === 'CERRADO' || exp.estado === 'VENCIDO' ? '#ef4444' : exp.estado === 'AUDIENCIA PROGRAMADA' ? '#f59e0b' : '#3b82f6'
          }}>{exp.estado}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {([
          { key: 'info', label: 'Información' },
          { key: 'docs', label: 'Documentos' },
          { key: 'mesa', label: 'Mesa de Partes' },
          { key: 'videos', label: 'Videos' },
        ] as const).map(t => (
          <button key={t.key} className={`tab ${tabActiva === t.key ? 'active' : ''}`} onClick={() => setTabActiva(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Información */}
      {tabActiva === 'info' && (
        <>
          <div className="detail-grid">
            <div className="card">
              <h2 style={{ fontSize: '1rem', marginBottom: 12 }}>Información General</h2>
              <div className="detail-row"><label>Materia</label><span>{exp.nombre_materia}</span></div>
              <div className="detail-row"><label>Sede</label><span>{exp.nombre_sede}</span></div>
              <div className="detail-row"><label>Conciliador</label><span>{exp.nombre_conciliador || 'Sin asignar'}</span></div>
              <div className="detail-row"><label>Motivo</label><span>{exp.motivo || '-'}</span></div>
              <div className="detail-row"><label>Pretensiones</label><span>{exp.pretensiones || '-'}</span></div>
              <div className="detail-row"><label>Fecha Creación</label><span>{new Date(exp.fecha_creacion).toLocaleDateString()}</span></div>
              <div className="detail-row"><label>Fecha Vencimiento</label><span>{new Date(exp.fecha_vencimiento).toLocaleDateString()}</span></div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 style={{ fontSize: '1rem' }}>Partes</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddParte(!showAddParte)}><UserPlus size={16} /> Agregar</button>
              </div>
              {showAddParte && (
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3 mb-3">
                  <div className="flex gap-2 items-end flex-wrap">
                    <div className="form-group flex-1" style={{ marginBottom: 0 }}>
                      <label>Persona</label>
                      <select value={nuevaParte.personaId} onChange={e => setNuevaParte(p => ({ ...p, personaId: e.target.value }))}>
                        <option value="">Seleccione...</option>
                        {personas.map(p => <option key={p.id} value={p.id}>{p.nombres ? `${p.nombres} ${p.apellidos}` : p.razon_social}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Tipo</label>
                      <select value={nuevaParte.tipoParte} onChange={e => setNuevaParte(p => ({ ...p, tipoParte: e.target.value }))}>
                        <option value="Solicitante">Solicitante</option>
                        <option value="Invitado">Invitado</option>
                      </select>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={agregarParte}><Plus size={16} /> Agregar</button>
                  </div>
                </div>
              )}
              {partes.map(p => (
                <div key={p.id} className="parte-item">
                  <span className="badge" style={{ background: p.tipo_parte === 'Solicitante' ? '#10b981' : '#f59e0b' }}>{p.tipo_parte}</span>
                  <span style={{ fontSize: '0.88rem' }}>{p.nombres} {p.apellidos}{p.razon_social}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: '1rem', marginBottom: 12 }}>Acciones</h2>
            <div className="detail-grid">
              <div>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label>Cambiar Estado</label>
                  <div className="flex gap-2">
                    <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)} style={{ flex: 1 }}>
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={cambiarEstado}><RefreshCw size={16} /> Actualizar</button>
                  </div>
                </div>
              </div>
              <div>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label>Asignar Conciliador</label>
                  <div className="flex gap-2">
                    <select value={conciliadorSel} onChange={e => setConciliadorSel(e.target.value)} style={{ flex: 1 }}>
                      <option value="">{exp.nombre_conciliador || 'Sin asignar'}</option>
                      {conciliadores.filter(c => c.id !== exp.conciliador_id).map(c => <option key={c.id} value={c.id}>{c.nombres} {c.apellidos}</option>)}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={asignarConciliador}><UserCheck size={16} /> Asignar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: '1rem', marginBottom: 12 }}>Audiencias</h2>
            <table>
              <thead><tr><th>Fecha</th><th>Modalidad</th><th>Resultado</th><th>Estado</th></tr></thead>
              <tbody>
                {audiencias.map(a => (
                  <tr key={a.id}>
                    <td>{new Date(a.fecha).toLocaleString()}</td>
                    <td>{a.modalidad}</td>
                    <td>{a.resultado || '-'}</td>
                    <td>{a.estado}</td>
                  </tr>
                ))}
                {audiencias.length === 0 && <tr><td colSpan={4} className="empty-state" style={{ padding: 24 }}>Sin audiencias registradas</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: '1rem', marginBottom: 12 }}>Archivos</h2>
            <div className="flex gap-4 items-end mb-4">
              <input type="file" ref={fileRef} />
              <button className="btn btn-primary btn-sm" onClick={uploadFile}><Upload size={16} /> Subir Archivo</button>
            </div>
            {repositorio.map(r => (
              <div key={r.id} className="file-item">
                <span><FileText size={16} className="text-muted" /> {r.nombre_archivo}</span>
                <span className="file-meta">{(r.tamanio / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB: Documentos */}
      {tabActiva === 'docs' && (
        <div className="card">
          <h2 style={{ fontSize: '1rem', marginBottom: 16 }}>Generar Documento Legal</h2>

          {msgDoc && (
            <div className={`alert ${msgDoc.includes('✅') ? 'alert-success' : 'alert-error'}`}>
              {msgDoc}
            </div>
          )}

          <div className="flex gap-4 items-end flex-wrap">
            <div className="form-group" style={{ flex: 1, minWidth: 250 }}>
              <label>Tipo de Documento</label>
              <select value={tipoDocSel} onChange={e => setTipoDocSel(e.target.value)}>
                {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={generarDocumento} disabled={generando}>
              <FileText size={18} /> {generando ? 'Generando...' : 'Generar Documento'}
            </button>
          </div>

          <h3 style={{ fontSize: '0.9rem', marginTop: 24, marginBottom: 12 }}>Documentos Generados</h3>
          <table>
            <thead><tr><th>Tipo</th><th>Generado por</th><th>Fecha</th><th></th></tr></thead>
            <tbody>
              {documentos.map(d => (
                <tr key={d.id}>
                  <td><FileText size={16} className="text-muted" /> {d.tipo_documento}</td>
                  <td>{d.generado_por_nombre}</td>
                  <td>{new Date(d.generado_en).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => downloadFile(d)}>
                      <Download size={14} /> Descargar
                    </button>
                  </td>
                </tr>
              ))}
              {documentos.length === 0 && (
                <tr><td colSpan={4} className="empty-state" style={{ padding: 24 }}>No hay documentos generados aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Mesa de Partes */}
      {tabActiva === 'mesa' && (
        <div className="card">
          <h2 style={{ fontSize: '1rem', marginBottom: 16 }}>Mesa de Partes - Documentos Requeridos</h2>
          {mesaPartes.length === 0 ? (
            <p className="text-muted">No hay requisitos documentales configurados para esta materia.</p>
          ) : (
            <table>
              <thead><tr><th>Documento</th><th>Obligatorio</th><th>Presentado</th><th>Acción</th></tr></thead>
              <tbody>
                {mesaPartes.map((mp: any) => (
                  <tr key={mp.requisito_id || mp.id}>
                    <td>{mp.nombre_doc}</td>
                    <td>{mp.obligatorio ? <span className="badge badge-error">Sí</span> : <span className="badge badge-info">No</span>}</td>
                    <td>{mp.presentado ? <CheckCircle size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-500" />}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${mp.presentado ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleMesaParte(mp.requisito_id || mp.id, mp.presentado)}
                      >
                        {mp.presentado ? 'Marcar No Presentado' : 'Marcar Presentado'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB: Videos */}
      {tabActiva === 'videos' && (
        <div className="card">
          <h2 style={{ fontSize: '1rem', marginBottom: 16 }}>Videos del Expediente</h2>
          <div className="flex gap-4 items-end mb-4">
            <input type="file" ref={videoRef} accept=".mp4,.webm,.ogg,.mov" />
            <button className="btn btn-primary btn-sm" onClick={uploadVideo}>
              <Video size={16} /> Subir Video
            </button>
          </div>
          <table>
            <thead><tr><th>Nombre</th><th>Subido por</th><th>Fecha</th><th></th></tr></thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id}>
                  <td><Video size={16} className="text-muted" /> {v.nombre_video}</td>
                  <td>{v.subido_por_nombre}</td>
                  <td>{new Date(v.subido_en).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => downloadFile(v)}>
                      <Download size={14} /> Descargar
                    </button>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr><td colSpan={4} className="empty-state" style={{ padding: 24 }}>No hay videos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
