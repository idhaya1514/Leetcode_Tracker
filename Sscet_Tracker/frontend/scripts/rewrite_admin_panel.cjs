const fs = require('fs');

const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/AdminPanel.tsx';

const content = `import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, Activity, Code2, Target, CheckCircle2 } from "lucide-react";
import { checkServerHealth, getStudents } from "../services/api";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdminPanelProps {
  onLogout: () => void;
  onNavigate: (page: any) => void;
}

export default function AdminPanel({ onLogout, onNavigate }: AdminPanelProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error: any) {
      toast.error("Failed to load dashboard data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for now since we don't have all the backend endpoints yet
  const totalStudents = students.length;
  const totalStaff = 12; 
  const activeToday = 45;
  const presentToday = 120;
  const absentToday = totalStudents - presentToday > 0 ? totalStudents - presentToday : 0;
  
  const totalSolved = 3450;
  const easySolved = 1500;
  const mediumSolved = 1200;
  const hardSolved = 750;
  const completionPercentage = 68;

  const weeklyActivityData = [
    { name: "Mon", active: 40 },
    { name: "Tue", active: 55 },
    { name: "Wed", active: 30 },
    { name: "Thu", active: 70 },
    { name: "Fri", active: 45 },
    { name: "Sat", active: 20 },
    { name: "Sun", active: 25 },
  ];

  const StatCard = ({ title, value, icon: Icon, color, suffix = "" }: any) => (
    <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={\`w-12 h-12 rounded-xl flex items-center justify-center \${color.bg}\`}>
          <Icon className={\`w-6 h-6 \${color.text}\`} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-800 mb-1">
          {value}{suffix}
        </h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
          <p className="text-slate-500 text-sm">System-wide performance metrics</p>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={totalStudents} icon={Users} color={{ bg: "bg-blue-50", text: "text-blue-600" }} />
        <StatCard title="Total Staff" value={totalStaff} icon={UserCheck} color={{ bg: "bg-indigo-50", text: "text-indigo-600" }} />
        <StatCard title="Present Today" value={presentToday} icon={Activity} color={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
        <StatCard title="Absent Today" value={absentToday} icon={UserX} color={{ bg: "bg-rose-50", text: "text-rose-600" }} />
      </div>

      {/* LeetCode Specific KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-center items-center text-center">
            <Code2 className="w-8 h-8 text-indigo-500 mb-2" />
            <p className="text-2xl font-black text-slate-800">{totalSolved}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Solved</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-center items-center text-center">
            <Target className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="text-2xl font-black text-slate-800">{completionPercentage}%</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completion</p>
          </div>
          <div className="col-span-2 bg-slate-900 rounded-2xl p-5 text-white">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Difficulty Breakdown</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-emerald-400">Easy</span><span className="font-bold">{easySolved}</span></div>
                <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '60%' }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-yellow-400">Medium</span><span className="font-bold">{mediumSolved}</span></div>
                <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '30%' }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-rose-400">Hard</span><span className="font-bold">{hardSolved}</span></div>
                <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-rose-400 h-1.5 rounded-full" style={{ width: '10%' }}></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Weekly Activity
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="active" name="Active Students" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path, content);
console.log("Updated AdminPanel!");
