import { useEffect, useState } from 'react';
import { materiaApi } from '../../api/axios';
import { Plus, X, Pencil, Trash2, ArrowLeft, Save, FileText, ListChecks } from 'lucide-react';

export default function MateriasList() {
  const [tipos, setTipos] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [tipoSel, setTipoSel] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMateria, setEditingMateria] = useState<any>(null);
  const [newMateria, setNewMateria] = useState({ tipoMateriaId: '', nombre: '' });

  const [requisitos, setRequisitos] = useState<any[]>([]);
  const [showRequisitos, setShowRequisitos] = useState<number | null>(null);
  const [newReq, setNewReq] = useState({ nombreDoc: '', obligatorio: true });

  useEffect(() => {
    materiaApi.tipos().then(r => setTipos(r.data));
  }, []);

  const loadMaterias = (tipoId: number) => {
    setTipoSel(tipoId);
    materiaApi.porTipo(tipoId).then(r => setMaterias(r.data));
  };

  const loadRequisitos = (materiaId: number) => {
    setShowRequisitos(materiaId);
    materiaApi.requisitos(materiaId).then(r => setRequisitos(r.data));
  };

  const openNew = () => {
    setEditingMateria(null);
    setNewMateria({ tipoMateriaId: tipoSel?.toString() || '', nombre: '' });
    setShowModal(true);
  };

  const openEdit = (m: any) => {
    setEditingMateria(m);
    setNewMateria({ tipoMateriaId: m.tipo_materia_id?.toString() || tipoSel?.toString() || '', nombre: m.nombre || '' });
    setShowModal(true);
  };

  const saveMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMateria) {
      await materiaApi.update(editingMateria.id, { tipoMateriaId: Number(newMateria.tipoMateriaId), nombre: newMateria.nombre });
    } else {
      await materiaApi.create({ tipoMateriaId: Number(newMateria.tipoMateriaId), nombre: newMateria.nombre });
    }
    setShowModal(false);
    setEditingMateria(null);
    setNewMateria({ tipoMateriaId: '', nombre: '' });
    if (tipoSel) materiaApi.porTipo(tipoSel).then(r => setMaterias(r.data));
  };

  const removeMateria = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta materia?')) return;
    await materiaApi.remove(id);
    if (tipoSel) materiaApi.porTipo(tipoSel).then(r => setMaterias(r.data));
  };

  const addRequisito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRequisitos || !newReq.nombreDoc) return;
    await materiaApi.createRequisito({ materiaId: showRequisitos, nombreDoc: newReq.nombreDoc, obligatorio: newReq.obligatorio });
    setNewReq({ nombreDoc: '', obligatorio: true });
    loadRequisitos(showRequisitos);
  };

  const removeRequisito = async (id: number) => {
    if (!confirm('¿Eliminar requisito?')) return;
    await materiaApi.removeRequisito(id);
    if (showRequisitos) loadRequisitos(showRequisitos);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Materias</h1>
        <button className="btn btn-primary" onClick={openNew}><Plus size={18} /> Nueva Materia</button>
      </div>

      {tipos.length > 0 && (
        <div className="tabs" style={{ width: 'fit-content', marginBottom: 4 }}>
          {tipos.map(t => (
            <button key={t.id} className={`tab ${tipoSel === t.id ? 'active' : ''}`} onClick={() => loadMaterias(t.id)}>
              {t.nombre}
            </button>
          ))}
        </div>
      )}

      {!tipoSel && <div className="empty-state"><p>Seleccione un tipo de materia para ver sus materias</p></div>}

      {tipoSel && materias.length === 0 && <div className="empty-state"><p>No hay materias registradas en esta categoría</p></div>}

      {tipoSel && materias.length > 0 && (
        <div className="table-container" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Materia</th><th>Requisitos</th><th></th></tr></thead>
            <tbody>
              {materias.map(m => (
                <tr key={m.id}>
                  <td>{m.nombre}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => loadRequisitos(m.id)}>
                      <ListChecks size={16} /> {showRequisitos === m.id ? 'Ocultar' : 'Ver Requisitos'}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(m)}><Pencil size={16} /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => removeMateria(m.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showRequisitos && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Requisitos Documentales</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => { setShowRequisitos(null); setRequisitos([]); }}>
              <X size={16} /> Cerrar
            </button>
          </div>
          <form onSubmit={addRequisito} className="flex gap-3 items-end mb-3">
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Nombre del Documento</label>
              <input value={newReq.nombreDoc} onChange={e => setNewReq(r => ({ ...r, nombreDoc: e.target.value }))} required placeholder="Ej: Copia de DNI" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Obligatorio</label>
              <select value={newReq.obligatorio ? 'true' : 'false'} onChange={e => setNewReq(r => ({ ...r, obligatorio: e.target.value === 'true' }))}>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-sm"><Plus size={16} /> Agregar</button>
          </form>

          {requisitos.length === 0 ? (
            <p className="text-muted">Sin requisitos registrados</p>
          ) : (
            requisitos.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg mb-1">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-muted" />
                  <span style={{ fontSize: '0.88rem' }}>{r.nombre_doc}</span>
                  {r.obligatorio && <span className="badge badge-error" style={{ fontSize: '0.65rem' }}>OBLIGATORIO</span>}
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => removeRequisito(r.id)}><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingMateria(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2>{editingMateria ? 'Editar Materia' : 'Nueva Materia'}</h2>
              <button className="btn btn-sm btn-secondary" onClick={() => { setShowModal(false); setEditingMateria(null); }}><X size={16} /></button>
            </div>
            <form onSubmit={saveMateria}>
              <div className="form-group">
                <label>Tipo de Materia *</label>
                <select value={newMateria.tipoMateriaId} onChange={e => setNewMateria(f => ({ ...f, tipoMateriaId: e.target.value }))} required>
                  <option value="">Seleccione...</option>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input value={newMateria.nombre} onChange={e => setNewMateria(f => ({ ...f, nombre: e.target.value }))} required placeholder="Nombre de la materia" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingMateria(null); }}><ArrowLeft size={18} /> Cancelar</button>
                <button type="submit" className="btn btn-primary"><Save size={18} /> {editingMateria ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
