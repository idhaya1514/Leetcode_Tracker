import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { LayoutDashboard, Users, UserCog, Settings, Database, TrendingUp } from 'lucide-react';

export default function AdminLayout({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Student Management', path: '/admin/students', icon: Users },
    { label: 'Staff Management', path: '/admin/staff', icon: UserCog },
    { label: 'Student Assignment', path: '/admin/assignment', icon: Database },

    { label: 'LeetCode Performance', path: '/admin/performance', icon: TrendingUp },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar role="Admin" navItems={navItems} onLogout={() => { onLogout(); navigate('/'); }} />
      <div className="flex-1 ml-64 flex flex-col h-screen">
        <Topbar userRole="Administrator" onLogout={() => { onLogout(); navigate('/'); }} />
        <main className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
