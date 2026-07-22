import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Topbar({ userRole, userName, onLogout }: { userRole: string, userName?: string, onLogout: () => void }) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Removed hamburger menu */}
        
      </div>
      
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(userRole === 'Administrator' ? '/admin/notifications' : '/staff/notifications')} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 mx-1"></div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-slate-700 capitalize">{userName || userRole}</p>
              <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-bold text-slate-800">{userName || userRole}</p>
                <p className="text-xs text-slate-500 mt-0.5">{userRole === 'Administrator' ? 'Admin Portal Access' : userRole === 'Student' ? 'Student Portal Access' : 'Staff Portal Access'}</p>
              </div>
              <div className="p-3 border-b border-slate-100 space-y-2">
                {userRole === "Administrator" ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Department</span>
                      <span className="font-semibold text-slate-700">All</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Students</span>
                      <span className="font-semibold text-slate-700 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">1,240</span>
                    </div>
                  </>
                ) : userRole === "Student" ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Status</span>
                      <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Active</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Department</span>
                      <span className="font-semibold text-slate-700">Computer Science</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Assigned Students</span>
                      <span className="font-semibold text-slate-700 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">35</span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-2">
                <button 
                  onClick={() => { onLogout(); navigate('/'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
