import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;

export const authApi = {
  login: (data: { email: string; password: string }) => API.post('/auth/login', data),
  register: (data: any) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) => API.put('/auth/change-password', data),
  forgotPassword: (email: string) => API.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) => API.post('/auth/reset-password', data),
};

export const sedeApi = {
  list: () => API.get('/sedes'),
  get: (id: number) => API.get(`/sedes/${id}`),
  create: (data: any) => API.post('/sedes', data),
  update: (id: number, data: any) => API.put(`/sedes/${id}`, data),
  toggle: (id: number) => API.put(`/sedes/${id}/toggle`),
};

export const trabajadorApi = {
  list: () => API.get('/trabajadores'),
  get: (id: number) => API.get(`/trabajadores/${id}`),
  search: (dni: string) => API.get(`/trabajadores/search/${dni}`),
  conciliadoresPorSede: (sedeId: number) => API.get(`/trabajadores/conciliadores/${sedeId}`),
  create: (data: any) => API.post('/trabajadores', data),
  update: (id: number, data: any) => API.put(`/trabajadores/${id}`, data),
  toggle: (id: number) => API.put(`/trabajadores/${id}/toggle`),
};

export const personaApi = {
  list: () => API.get('/personas'),
  get: (id: number) => API.get(`/personas/${id}`),
  buscarPorDocumento: (doc: string) => API.get(`/personas/buscar/${doc}`),
  createNatural: (data: any) => API.post('/personas/natural', data),
  createJuridica: (data: any) => API.post('/personas/juridica', data),
  update: (id: number, data: any) => API.put(`/personas/${id}`, data),
  toggle: (id: number) => API.put(`/personas/${id}/toggle`),
  createApoderado: (data: any) => API.post('/personas/apoderados', data),
  updateApoderado: (id: number, data: any) => API.put(`/personas/apoderados/${id}`, data),
  getApoderado: (id: number) => API.get(`/personas/apoderados/${id}`),
  createRepresentante: (data: any) => API.post('/personas/representantes', data),
  updateRepresentante: (id: number, data: any) => API.put(`/personas/representantes/${id}`, data),
  getRepresentante: (id: number) => API.get(`/personas/representantes/${id}`),
};

export const materiaApi = {
  tipos: () => API.get('/materias/tipos'),
  porTipo: (tipoId: number) => API.get(`/materias/por-tipo/${tipoId}`),
  get: (id: number) => API.get(`/materias/${id}`),
  requisitos: (materiaId: number) => API.get(`/materias/${materiaId}/requisitos`),
  create: (data: { tipoMateriaId: number; nombre: string }) => API.post('/materias', data),
  createRequisito: (data: { materiaId: number; nombreDoc: string; obligatorio: boolean }) => API.post('/materias/requisitos', data),
  removeRequisito: (id: number) => API.put(`/materias/requisitos/${id}`),
  update: (id: number, data: { tipoMateriaId?: number; nombre?: string }) => API.put(`/materias/${id}`, data),
  remove: (id: number) => API.delete(`/materias/${id}`),
};

export const expedienteApi = {
  list: (params?: any) => API.get('/expedientes', { params }),
  conciliador: () => API.get('/expedientes/conciliador'),
  get: (id: number) => API.get(`/expedientes/${id}`),
  generarNumero: (sedeId: number) => API.get(`/expedientes/generar-numero/${sedeId}`),
  create: (data: any) => API.post('/expedientes', data),
  cambiarEstado: (id: number, estado: string) => API.put(`/expedientes/${id}/estado`, { estado }),
  asignarConciliador: (id: number, conciliadorId: number) => API.put(`/expedientes/${id}/asignar-conciliador`, { conciliadorId }),
  partes: (id: number) => API.get(`/expedientes/${id}/partes`),
  agregarParte: (id: number, data: any) => API.post(`/expedientes/${id}/partes`, data),
  mesaPartes: (id: number) => API.get(`/expedientes/${id}/mesa-partes`),
  actualizarMesaPartes: (id: number, data: any) => API.post(`/expedientes/${id}/mesa-partes`, data),
  alertas: (id: number) => API.get(`/expedientes/${id}/alertas`),
};

export const audienciaApi = {
  porExpediente: (expedienteId: number) => API.get(`/audiencias/expediente/${expedienteId}`),
  create: (data: any) => API.post('/audiencias', data),
  registrarResultado: (id: number, data: any) => API.put(`/audiencias/${id}/resultado`, data),
};

export const dashboardApi = {
  indicadores: (params?: any) => API.get('/dashboard/indicadores', { params }),
  trimestres: (params?: any) => API.get('/dashboard/trimestres', { params }),
  alertas: () => API.get('/dashboard/alertas'),
  audienciasPorMes: () => API.get('/dashboard/audiencias-por-mes'),
  expedientesPorEstado: () => API.get('/dashboard/expedientes-por-estado'),
};

export const reporteApi = {
  list: (params: any) => API.get('/reportes', { params }),
  excel: (params: any) => API.get('/reportes/excel', { params, responseType: 'blob' }),
  pdf: (params: any) => API.get('/reportes/pdf', { params, responseType: 'blob' }),
};

export const repositorioApi = {
  list: (expedienteId: number) => API.get(`/repositorio/${expedienteId}`),
  upload: (expedienteId: number, file: FormData) => API.post(`/repositorio/${expedienteId}/upload`, file),
  delete: (id: number) => API.delete(`/repositorio/${id}`),
};

export const documentoApi = {
  porExpediente: (expedienteId: number) => API.get(`/documentos/expediente/${expedienteId}`),
  generar: (data: { expedienteId: number; tipoDocumento: string }) => API.post('/documentos/generar', data),
  registrar: (data: any) => API.post('/documentos/registrar', data),
  preaviso: (expedienteId: number) => API.get(`/documentos/preaviso/${expedienteId}`),
};

export const videoApi = {
  list: (expedienteId: number) => API.get(`/videos/${expedienteId}`),
  upload: (expedienteId: number, formData: FormData) => API.post(`/videos/${expedienteId}/upload`, formData),
  delete: (id: number) => API.delete(`/videos/${id}`),
};

export const ubigeoApi = {
  departamentos: () => API.get('/ubigeo/departamentos'),
  provincias: (departamentoId: number) => API.get(`/ubigeo/provincias/${departamentoId}`),
  distritos: (provinciaId: number) => API.get(`/ubigeo/distritos/${provinciaId}`),
};

export const chatbotApi = {
  context: () => API.get('/chatbot/context'),
  ask: (question: string) => API.post('/chatbot/ask', { question }),
};
