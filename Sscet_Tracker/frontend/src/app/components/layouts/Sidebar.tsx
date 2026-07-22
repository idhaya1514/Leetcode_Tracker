import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Users, UserCog, CheckSquare, BarChart, Settings, LogOut, Code2, Calendar } from 'lucide-react';

type NavItem = { label: string; path: string; icon: any };

export function Sidebar({ role, navItems, onLogout }: { role: string; navItems: NavItem[]; onLogout: () => void }) {
  return (
    <aside className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300 fixed left-0 top-0 z-40 transition-all duration-300 border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight">SSCET Tracker</h1>
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{role} Portal</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="px-3 mb-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Main Menu</p>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'hover:bg-slate-800 hover:text-white'}`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
