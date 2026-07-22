import { useState, useEffect } from "react";
import { Users, Activity, Code2, Target, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function StaffDashboard() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading data
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // Mock data for Staff Dashboard
  const totalStudents = 0;
  const presentToday = 0;
  const absentToday = 0;
  const completedTarget = 0;
  const pendingTarget = 0;
  
  const totalSolvedToday = 0;
  const avgPerformance = 0;
  const avgAttendance = 0;

  const weeklyActivityData = [
    { name: "Mon", active: 0 },
    { name: "Tue", active: 0 },
    { name: "Wed", active: 0 },
    { name: "Thu", active: 0 },
    { name: "Fri", active: 0 },
    { name: "Sat", active: 0 },
    { name: "Sun", active: 0 },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass, trend, trendValue }: any) => (
    <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-medium text-slate-500">{title}</h3>
        <div className={`p-1.5 rounded-md ${colorClass.bg}`}>
          <Icon className={`w-4 h-4 ${colorClass.text}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">{value}</h2>
        {trend && (
          <span className={`text-[11px] font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'} flex items-center`}>
            {trend === 'up' ? '+' : '-'}{trendValue}%
          </span>
        )}
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-xs font-medium mb-2">{label}</p>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Active Students</p>
              <p className="text-sm font-semibold text-white">{payload[0].value}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 border-t-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Staff Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor your assigned students' progress and attendance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <Target className="w-4 h-4" /> Assign Daily Target
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Students" value={totalStudents} icon={Users} colorClass={{ bg: "bg-blue-50", text: "text-blue-600" }} />
        <StatCard title="Present Today" value={presentToday} icon={Activity} trend="up" trendValue="2.4" colorClass={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
        <StatCard title="Completed Target" value={completedTarget} icon={CheckCircle2} trend="up" trendValue="15.2" colorClass={{ bg: "bg-indigo-50", text: "text-indigo-600" }} />
        <StatCard title="Pending Target" value={pendingTarget} icon={AlertCircle} trend="down" trendValue="4.1" colorClass={{ bg: "bg-rose-50", text: "text-rose-600" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Charts (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Class Engagement</h2>
                <p className="text-xs text-slate-500">Students active on LeetCode</p>
              </div>
              <select className="text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-md px-2 py-1 outline-none">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="active" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-orange-50 rounded-md">
                <Code2 className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">Class Performance</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Solved Today</p>
                <p className="text-2xl font-semibold text-slate-800">{totalSolvedToday}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Avg Score</p>
                <p className="text-2xl font-semibold text-slate-800">{avgPerformance}%</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl shadow-slate-900/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Attendance</h3>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-4xl font-semibold mb-2">{avgAttendance}%</p>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${avgAttendance}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Excellent consistency
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
