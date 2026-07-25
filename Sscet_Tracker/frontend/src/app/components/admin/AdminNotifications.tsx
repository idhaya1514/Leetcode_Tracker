import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Inbox, RefreshCw, MessageSquare } from 'lucide-react';
import { getNotifications, markNotificationRead, AppNotification } from '../../services/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications('admin');
      setNotifications(data);
    } catch (err: any) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await getNotifications('admin');
      setNotifications(data);
      toast.success('Inbox updated');
    } catch (err) {
      toast.error('Failed to refresh');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Visual delay
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      toast.success('Marked as read');
    } catch (err: any) {
      toast.error('Failed to mark as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-sapphire-500 to-indigo-600 rounded-xl shadow-lg shadow-sapphire-200 text-white">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Inbox & Notifications
            </h2>
          </div>
          <p className="text-slate-500 mt-2 font-medium">
            Manage your incoming messages from students and system alerts.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="relative flex h-3 w-3">
              {unreadCount > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${unreadCount > 0 ? 'bg-rose-500' : 'bg-slate-300'}`}></span>
            </span>
            <span className="font-bold text-slate-700">{unreadCount}</span>
            <span className="text-sm font-medium text-slate-500">Unread</span>
          </div>

          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 text-white font-semibold bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[500px]">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-sapphire-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-semibold animate-pulse">Syncing inbox...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
              <Inbox className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-2xl font-bold text-slate-700">All caught up!</p>
            <p className="text-slate-500 mt-2 font-medium">You have no new messages at this time.</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {notifications.map((notif, index) => (
              <div 
                key={notif.id} 
                className={`group relative p-6 rounded-2xl border transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in hover:shadow-lg ${
                  notif.isRead 
                    ? 'bg-white border-slate-200 opacity-80 hover:opacity-100' 
                    : 'bg-gradient-to-r from-sapphire-50/50 to-white border-sapphire-200 shadow-sm'
                }`}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                {!notif.isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-sapphire-500 rounded-l-2xl"></div>
                )}
                
                <div className="flex items-start gap-5">
                  <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${
                    notif.isRead ? 'bg-slate-100 text-slate-400' : 'bg-sapphire-100 text-sapphire-600'
                  }`}>
                    <MessageSquare className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-lg truncate ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notif.title}
                      </h3>
                      <span className="shrink-0 text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1 rounded-full whitespace-nowrap border border-slate-200/60">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className={`mt-3 pl-4 border-l-2 ${notif.isRead ? 'border-slate-200' : 'border-sapphire-200'} py-1`}>
                      <p className={`whitespace-pre-wrap text-sm leading-relaxed ${notif.isRead ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                  
                  {!notif.isRead && (
                    <div className="shrink-0 pt-2">
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="flex items-center justify-center p-2.5 text-sapphire-600 hover:text-white hover:bg-sapphire-600 rounded-xl transition-all duration-300 group/btn tooltip-trigger"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
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


