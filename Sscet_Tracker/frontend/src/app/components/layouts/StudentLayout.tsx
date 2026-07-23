import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { LayoutDashboard, CheckSquare, Code2, Target, BarChart3, FileText, Bell, User, Settings } from 'lucide-react';

export default function StudentLayout({ onLogout, student }: { onLogout: () => void, student: any }) {
  const navigate = useNavigate();
  const navItems = [
    { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { label: 'Today\'s Tasks', path: '/student/tasks', icon: CheckSquare },

    { label: 'Daily Target', path: '/student/tracker', icon: Target },
    { label: 'Performance', path: '/student/performance', icon: BarChart3 },
    { label: 'Reports', path: '/student/reports', icon: FileText },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
    { label: 'Profile', path: '/student/profile', icon: User },
    { label: 'Settings', path: '/student/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar role="Student" navItems={navItems} onLogout={() => { onLogout(); navigate('/'); }} />
      <div className="flex-1 ml-64 flex flex-col h-screen">
        <Topbar userRole="Student" userName={student?.name} onLogout={() => { onLogout(); navigate('/'); }} />
        <main className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
