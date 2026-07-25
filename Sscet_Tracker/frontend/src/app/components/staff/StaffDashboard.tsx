import { useState, useEffect } from "react";
import { Users, Activity, Code2, Target, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useOutletContext } from "react-router";
import { getStaffDashboardMetrics } from "../../services/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function StaffDashboard() {
  const { staff } = useOutletContext<{ staff: any }>();
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    completedTarget: 0,
    pendingTarget: 0,
    avgAttendance: 0,
    avgPerformance: 0
  });

  useEffect(() => {
    loadDashboard();
  }, [staff]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      if (staff?.staffId) {
        const data = await getStaffDashboardMetrics(staff.staffId || staff.id);
        setMetrics({
          totalStudents: data.totalStudents || 0,
          presentToday: data.presentToday || 0,
          absentToday: data.absentToday || 0,
          completedTarget: data.completedTarget || 0,
          pendingTarget: data.pendingTarget || 0,
          avgAttendance: data.avgAttendance || 0,
          avgPerformance: data.avgPerformance || 0
        });
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const { presentToday, absentToday, completedTarget, pendingTarget, totalStudents, avgPerformance, avgAttendance } = metrics;
  const totalSolvedToday = completedTarget;

  const weeklyActivityData = [
    { name: "Mon", active: 0 },
    { name: "Tue", active: 0 },
    { name: "Wed", active: 0 },
    { name: "Thu", active: 0 },
    { name: "Fri", active: 0 },
    { name: "Sat", active: 0 },
    { name: "Sun", active: 0 },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }: any) => (
    <div className="glass-panel p-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sapphire-900/5 group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-ink-600 tracking-wide uppercase">{title}</h3>
        <div className={`p-2 rounded-lg transition-colors ${colorClass.bg} group-hover:bg-cream-100`}>
          <Icon className={`w-4 h-4 ${colorClass.text}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <h2 className="text-3xl font-black text-ink-900 tracking-tight">{value}</h2>
        {trend && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center shadow-sm`}>
            {trend === 'up' ? '+' : '-'}{trendValue}%
          </span>
        )}
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-ink-900 border border-ink-800 rounded-lg p-3 shadow-xl">
          <p className="text-stone-400 text-xs font-medium mb-2">{label}</p>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] text-ink-500 uppercase">Active Students</p>
              <p className="text-sm font-semibold text-cream-100">{payload[0].value}</p>
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
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Staff Overview</h1>
          <p className="text-ink-600 text-sm mt-1">Monitor your assigned students' progress and attendance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-cream-100 border border-stone-200 text-ink-600 text-sm font-medium rounded-lg hover:bg-cream-200 transition-colors shadow-sm flex items-center gap-2">
            <Target className="w-4 h-4" /> Assign Daily Target
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-stagger">
        <StatCard title="Assigned Students" value={totalStudents} icon={Users} colorClass={{ bg: "bg-sapphire-100", text: "text-sapphire-800" }} />
        <StatCard title="Present Today" value={presentToday} icon={Activity} trend="up" trendValue="2.4" colorClass={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
        <StatCard title="Completed Target" value={completedTarget} icon={CheckCircle2} trend="up" trendValue="15.2" colorClass={{ bg: "bg-cream-200", text: "text-ink-900" }} />
        <StatCard title="Pending Target" value={pendingTarget} icon={AlertCircle} trend="down" trendValue="4.1" colorClass={{ bg: "bg-rose-50", text: "text-rose-600" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-stagger">
        {/* Left Side: Charts (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-ink-900">Class Engagement</h2>
                <p className="text-xs text-ink-600">Students active on LeetCode</p>
              </div>
              <select className="text-xs bg-cream-200 border border-stone-200 text-ink-600 rounded-md px-2 py-1 outline-none">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#263545" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#263545" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2ddd6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a09588' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a09588' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#c4bcb0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="active" stroke="#263545" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-gold-100 rounded-md">
                <Code2 className="w-4 h-4 text-gold-700" />
              </div>
              <h2 className="text-base font-semibold text-ink-900">Class Performance</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-cream-200 border border-stone-200">
                <p className="text-[11px] font-medium text-ink-600 uppercase tracking-wider mb-1">Solved Today</p>
                <p className="text-2xl font-semibold text-ink-900">{totalSolvedToday}</p>
              </div>
              <div className="p-4 rounded-xl bg-cream-200 border border-stone-200">
                <p className="text-[11px] font-medium text-ink-600 uppercase tracking-wider mb-1">Avg Score</p>
                <p className="text-2xl font-semibold text-ink-900">{avgPerformance}%</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-ink-900 rounded-xl p-5 text-cream-100 shadow-xl shadow-ink-900/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Avg Attendance</h3>
                  <Calendar className="w-4 h-4 text-stone-400" />
                </div>
                <p className="text-4xl font-semibold mb-2">{avgAttendance}%</p>
                <div className="w-full bg-ink-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${avgAttendance}%` }}></div>
                </div>
                <p className="text-xs text-stone-400 mt-3 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Excellent consistency
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

