import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBar from './NotificationBar';
import ChatbotWidget from './ChatbotWidget';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { usuario, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-400 animate-pulse text-base">Cargando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="flex items-center justify-end mb-2">
          <NotificationBar />
        </div>
        <Outlet />
      </main>
      <ChatbotWidget />
    </div>
  );
}
