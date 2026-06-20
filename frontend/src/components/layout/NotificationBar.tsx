import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../services/socket';
import { Bell } from 'lucide-react';

export default function NotificationBar() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('expediente_creado', (data: any) => {
      addNotification(`Nuevo expediente: ${data.numero}`);
    });
    socket.on('estado_cambiado', (data: any) => {
      addNotification(`Estado actualizado a: ${data.estado}`);
    });
    socket.on('conciliador_asignado', () => {
      addNotification('Conciliador asignado');
    });
    socket.on('resultado_registrado', (data: any) => {
      addNotification(`Resultado: ${data.resultado}`);
    });

    return () => { socket.removeAllListeners(); };
  }, []);

  useEffect(() => {
    if (!show) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show]);

  const addNotification = (msg: string) => {
    setNotifications(prev => [...prev.slice(-4), msg]);
  };

  return (
    <div className="notification-wrapper" ref={ref}>
      <button className="notification-btn" onClick={() => setShow(v => !v)}>
        <Bell size={20} />
        {notifications.length > 0 && <span className="notification-dot">{notifications.length > 9 ? '9+' : notifications.length}</span>}
      </button>
      {show && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <div className="notification-item" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Sin notificaciones
            </div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="notification-item">{n}</div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
