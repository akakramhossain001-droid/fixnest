import { ArrowLeft, CheckCircle2, Gift, Wallet, Wrench, ShieldAlert, CheckCheck, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NotificationFeedScreenProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationFeedScreen({ onBack }: NotificationFeedScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIconConfig = (type: string) => {
    switch(type) {
      case 'booking': return { icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-50' };
      case 'wallet': return { icon: Wallet, color: 'text-teal', bgColor: 'bg-teal-light/50' };
      case 'security': return { icon: ShieldAlert, color: 'text-amber-500', bgColor: 'bg-amber-50' };
      case 'system': return { icon: Gift, color: 'text-purple-500', bgColor: 'bg-purple-50' };
      default: return { icon: Bell, color: 'text-blue-500', bgColor: 'bg-blue-50' };
    }
  };
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <header className="bg-white px-4 h-14 flex items-center justify-between border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="font-heading font-bold text-lg text-text-primary ml-2">Notifications</h1>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-teal-light/20 text-teal transition-colors"
            title="Mark all as read"
          >
            <CheckCheck size={20} />
          </button>
        )}
      </header>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {loading ? (
          <p className="text-center text-text-secondary mt-10">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <p className="text-text-secondary font-medium">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const { icon: Icon, color, bgColor } = getIconConfig(notif.type);
              return (
                <div 
                  key={notif.id} 
                  className={`bg-white p-4 rounded-2xl border transition-all ${
                    !notif.isRead ? 'border-teal/30 shadow-[0_4px_12px_rgba(32,178,170,0.08)]' : 'border-gray-100 shadow-sm'
                  } flex gap-4`}
                >
                  <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${bgColor}`}>
                    <Icon size={22} className={color} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`text-sm font-bold truncate ${!notif.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-teal shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed mb-2">
                      {notif.message}
                    </p>
                    <span className="text-[11px] font-medium text-gray-400">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
