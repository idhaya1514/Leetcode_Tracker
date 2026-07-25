import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { 
  LayoutDashboard, Users, Code2, Calendar, 
  TrendingUp, CheckSquare, Mail, Bell, 
  BarChart, User, Settings 
} from 'lucide-react';

export default function StaffLayout({ onLogout, staff }: { onLogout: () => void, staff: any }) {
  const navigate = useNavigate();
  const navItems = [
    { label: 'Dashboard', path: '/staff', icon: LayoutDashboard },
    { label: 'Students', path: '/staff/students', icon: Users },
    { label: 'LeetCode Tracker', path: '/staff/leetcode', icon: Code2 },
    { label: 'Daily Attendance', path: '/staff/attendance', icon: Calendar },
    { label: 'Daily Progress', path: '/staff/progress', icon: TrendingUp },
    { label: 'Task Management', path: '/staff/tasks', icon: CheckSquare },
    { label: 'Email Center', path: '/staff/emails', icon: Mail },
    { label: 'Notifications', path: '/staff/notifications', icon: Bell },
    { label: 'Reports', path: '/staff/reports', icon: BarChart },
    { label: 'Profile', path: '/staff/profile', icon: User },
    { label: 'Settings', path: '/staff/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar role="Staff" navItems={navItems} onLogout={onLogout} />
      <div className="flex-1 ml-64 flex flex-col h-screen">
        <Topbar userRole="Staff" userName={staff?.name} userDetails={staff} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-500">
          <Outlet context={{ staff }} />
        </main>
      </div>
    </div>
  );
}
