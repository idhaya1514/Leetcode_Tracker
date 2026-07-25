import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, ChevronDown, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getNotifications, markNotificationRead } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

export function Topbar({ userRole, userName, userDetails, onLogout }: { userRole: string, userName?: string, userDetails?: any, onLogout: () => void }) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const getUserId = () => {
    if (userRole === 'Administrator') return 'admin';
    if (userRole === 'Student') {
      const s = JSON.parse(sessionStorage.getItem('currentStudent') || '{}');
      return s.registerNumber || '';
    }
    const st = JSON.parse(sessionStorage.getItem('currentStaff') || '{}');
    return st.staffId || '';
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll every minute for live updates
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const uid = getUserId();
    if (!uid) return;
    try {
      const data = await getNotifications(uid);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('task') || title.toLowerCase().includes('assign')) return <AlertCircle className="w-4 h-4 text-sapphire-600" />;
    if (title.toLowerCase().includes('complet')) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    return <MessageSquare className="w-4 h-4 text-gold-600" />;
  };

  return (
    <header className="h-16 bg-cream-100/80 backdrop-blur-md border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Removed hamburger menu */}
        
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-stone-400 hover:bg-cream-200 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-hidden glass-panel rounded-xl shadow-xl border border-stone-200 animate-in fade-in slide-in-from-top-2 duration-200 z-50 flex flex-col">
              <div className="p-4 border-b border-stone-100 bg-cream-200/50 sticky top-0 z-10 flex items-center justify-between">
                <h3 className="font-semibold text-ink-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-sapphire-100 text-sapphire-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto max-h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-stone-500">
                    No Notifications
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                        className={`p-4 hover:bg-cream-200/50 transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-sapphire-50/30' : ''}`}
                      >
                        <div className="mt-1">{getIcon(notif.title)}</div>
                        <div>
                          <p className={`text-sm ${!notif.isRead ? 'font-semibold text-ink-900' : 'font-medium text-ink-700'}`}>{notif.title}</p>
                          <p className="text-xs text-ink-500 mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] font-medium text-stone-400 mt-2 uppercase tracking-wider">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="h-8 w-px bg-stone-200 mx-1"></div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
            className="flex items-center gap-3 hover:bg-cream-200 p-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-ink-900 capitalize">{userName || userRole}</p>
              <p className="text-[10px] font-semibold text-gold-600 uppercase tracking-wider flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span> Online
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-sapphire-800 text-cream-100 flex items-center justify-center font-medium text-sm shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
              <div className="p-4 border-b border-stone-100 bg-stone-50">
                <p className="text-sm font-semibold text-ink-900">{userName || userRole}</p>
                <p className="text-xs text-ink-500 mt-1">{userDetails?.email || (userRole === 'Administrator' ? 'admin@school.edu' : '')}</p>
                <p className="text-[10px] font-medium text-sapphire-600 mt-1.5 uppercase tracking-wider bg-sapphire-50 inline-block px-2 py-0.5 rounded">
                  {userRole} Portal
                </p>
              </div>
              <div className="p-4 border-b border-stone-100 space-y-3">
                {userRole === "Administrator" ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-ink-600">Department</span>
                      <span className="font-medium text-ink-900">All</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-ink-600">Total Students</span>
                      <span className="font-medium text-sapphire-800 bg-sapphire-100 px-2 py-0.5 rounded-md">1,240</span>
                    </div>
                  </>
                ) : userRole === "Student" ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-ink-600">Status</span>
                      <span className="font-medium text-gold-700 bg-gold-100 px-2 py-0.5 rounded-md">Active</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-500 font-medium">Department</span>
                      <span className="font-semibold text-ink-900">{userDetails?.department?.name || userDetails?.department || 'Not Assigned'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-500 font-medium">Assigned Students</span>
                      <span className="font-bold text-sapphire-800 bg-sapphire-100 px-2.5 py-0.5 rounded-md">
                        {userDetails?.assignedStudents?.length || userDetails?.assignedStudentCount || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-2">
                <button 
                  onClick={() => { onLogout(); navigate('/'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
