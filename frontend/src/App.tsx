import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Layout from './components/layout/Layout';
import HomePage from './pages/Home/HomePage';
import Dashboard from './pages/Dashboard/Dashboard';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import AccessDenied from './pages/Auth/AccessDenied';
import ExpedientesList from './pages/Expedientes/ExpedientesList';
import ExpedienteDetail from './pages/Expedientes/ExpedienteDetail';
import ExpedienteForm from './pages/Expedientes/ExpedienteForm';
import AudienciasPage from './pages/Audiencias/AudienciasPage';
import PersonasList from './pages/Personas/PersonasList';
import PersonaForm from './pages/Personas/PersonaForm';
import PersonaDetail from './pages/Personas/PersonaDetail';
import TrabajadoresList from './pages/Trabajadores/TrabajadoresList';
import SedesList from './pages/Sedes/SedesList';
import MateriasList from './pages/Materias/MateriasList';
import Reportes from './pages/Reportes/Reportes';
import ProfilePage from './pages/Profile/ProfilePage';
import RepositorioPage from './pages/Repositorio/RepositorioPage';

function AppRoutes() {
  const { usuario, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-400 animate-pulse text-base">Cargando...</div>;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={usuario ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={usuario ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/acceso-denegado" element={<AccessDenied />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expedientes" element={<ExpedientesList />} />
        <Route path="/expedientes/nuevo" element={<ExpedienteForm />} />
        <Route path="/expedientes/:id" element={<ExpedienteDetail />} />
        <Route path="/expedientes/:id/repositorio" element={<RepositorioPage />} />
        <Route path="/audiencias" element={<AudienciasPage />} />
        <Route path="/personas" element={<PersonasList />} />
        <Route path="/personas/nueva" element={<PersonaForm />} />
        <Route path="/personas/:id" element={<PersonaForm />} />
        <Route path="/personas/:id/detalle" element={<PersonaDetail />} />
        <Route path="/trabajadores" element={<TrabajadoresList />} />
        <Route path="/sedes" element={<SedesList />} />
        <Route path="/materias" element={<MateriasList />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}