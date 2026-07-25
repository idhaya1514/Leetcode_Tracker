import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Inbox } from 'lucide-react';
import { getNotifications, markNotificationRead, AppNotification } from '../../services/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface StaffNotificationsProps {
  staff: any;
}

export default function StaffNotifications({ staff }: StaffNotificationsProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = staff?.staffId || staff?.id;
    if (id) {
      loadNotifications(id);
    } else {
      setIsLoading(false);
    }
  }, [staff]);

  const loadNotifications = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getNotifications(id);
      setNotifications(data);
    } catch (err: any) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err: any) {
      toast.error('Failed to mark as read');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-500" /> Notifications & Messages
          </h1>
          <p className="text-slate-500 text-sm mt-1">Direct messages from your assigned students.</p>
        </div>
        <button 
          onClick={() => loadNotifications(staff?.staffId || staff?.id)}
          className="text-indigo-600 font-semibold hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading inbox...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
            <Inbox className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Your inbox is empty</p>
            <p className="text-sm mt-1">You have no new messages or notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-6 transition-colors duration-300 ${notif.isRead ? 'bg-white opacity-70' : 'bg-indigo-50/50'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {!notif.isRead && <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>}
                      <h3 className={`font-bold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-slate-600 whitespace-pre-wrap pl-5 border-l-2 border-slate-200 ml-1 mt-3 text-sm">
                      {notif.message}
                    </p>
                  </div>
                  
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="shrink-0 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all duration-300 group"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

