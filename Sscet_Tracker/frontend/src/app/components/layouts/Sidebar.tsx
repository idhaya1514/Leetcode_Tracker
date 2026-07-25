import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Users, UserCog, CheckSquare, BarChart, Settings, LogOut, Code2, Calendar } from 'lucide-react';

type NavItem = { label: string; path: string; icon: any };

export function Sidebar({ role, navItems, onLogout }: { role: string; navItems: NavItem[]; onLogout: () => void }) {
  return (
    <aside className="w-64 bg-sapphire-900 h-screen flex flex-col text-cream-100 fixed left-0 top-0 z-40 transition-all duration-300 border-r border-sapphire-800 shadow-md">
      <div className="h-16 flex items-center px-6 border-b border-sapphire-800 bg-sapphire-900">
        <div className="flex items-center gap-2.5">
          <div>
            <h1 className="text-sm font-semibold text-cream-100 tracking-tight">SSCET Tracker</h1>
            <p className="text-[10px] font-medium text-gold-500 uppercase tracking-widest">{role} Portal</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="px-3 mb-2">
          <p className="text-[11px] font-medium text-sapphire-300 uppercase tracking-wider">Main Menu</p>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-sapphire-800 to-sapphire-900/50 text-gold-500 border-l-4 border-gold-500 rounded-r-lg shadow-sm' : 'hover:bg-sapphire-800 hover:text-cream-100 text-sapphire-100 rounded-lg'}`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
      
    </aside>
  );
}
