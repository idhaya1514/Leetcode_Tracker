import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, UserCheck, UserX, Activity, Code2, Target, Trophy, Flame, ChevronRight, TrendingUp } from "lucide-react";
import { checkServerHealth, getStudents } from "../services/api";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
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

  const navigate = useNavigate();

  const handleExportReport = () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8,Student Name,Department,Year,Status\nJohn Doe,CSE,3,Active\nJane Smith,IT,2,Active\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "system_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Report downloaded successfully");
    } catch (e) {
      toast.error("Failed to export report");
    }
  };


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

  const totalStudents = students.length;
  const totalStaff = 0; 
  const activeToday = 0;
  const presentToday = 0;
  const absentToday = totalStudents - presentToday > 0 ? totalStudents - presentToday : 0;
  
  const totalSolved = 0;
  const easySolved = 0;
  const mediumSolved = 0;
  const hardSolved = 0;
  const completionPercentage = 0;

  const weeklyActivityData = [
    { name: "Mon", active: 0, previous: 0 },
    { name: "Tue", active: 0, previous: 0 },
    { name: "Wed", active: 0, previous: 0 },
    { name: "Thu", active: 0, previous: 0 },
    { name: "Fri", active: 0, previous: 0 },
    { name: "Sat", active: 0, previous: 0 },
    { name: "Sun", active: 0, previous: 0 },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }: any) => (
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
              <p className="text-[10px] text-slate-500 uppercase">This Week</p>
              <p className="text-sm font-semibold text-white">{payload[0].value} Active</p>
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
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Track system performance and student engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportReport} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={totalStudents} icon={Users} trend="up" trendValue="12" colorClass={{ bg: "bg-blue-50", text: "text-blue-600" }} />
        <StatCard title="Active Staff" value={totalStaff} icon={UserCheck} colorClass={{ bg: "bg-indigo-50", text: "text-indigo-600" }} />
        <StatCard title="Present Today" value={presentToday} icon={Activity} trend="up" trendValue="4.2" colorClass={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
        <StatCard title="Absent Today" value={absentToday} icon={UserX} trend="down" trendValue="1.5" colorClass={{ bg: "bg-rose-50", text: "text-rose-600" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Charts & Graph (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Chart */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Engagement Overview</h2>
                <p className="text-xs text-slate-500">Active students completing daily targets</p>
              </div>
              <select className="text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-md px-2 py-1 outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side: LeetCode Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-orange-50 rounded-md">
                <Code2 className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">LeetCode Pulse</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Total Solved</p>
                <p className="text-2xl font-semibold text-slate-800">{totalSolved}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Completion</p>
                <p className="text-2xl font-semibold text-slate-800">{completionPercentage}%</p>
              </div>
            </div>

            <div className="space-y-5 flex-1">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Difficulty Distribution</h3>
              
              <div className="space-y-4">
                <div className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Easy
                    </span>
                    <span className="font-semibold text-slate-800">{easySolved}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 group-hover:opacity-80" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Medium
                    </span>
                    <span className="font-semibold text-slate-800">{mediumSolved}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-yellow-500 h-1.5 rounded-full transition-all duration-1000 group-hover:opacity-80" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> Hard
                    </span>
                    <span className="font-semibold text-slate-800">{hardSolved}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-1000 group-hover:opacity-80" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button onClick={() => navigate('/admin/performance')} className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              View Detailed Analytics <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
