import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, UserCheck, UserX, Activity, Code2, Target, Trophy, Flame, ChevronRight, TrendingUp } from "lucide-react";
import { checkServerHealth, getDashboardOverview, getStudents } from "../../services/api";
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
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleExportReport = async () => {
    try {
      const toastId = toast.loading("Generating report...");
      const students = await getStudents(true); // Fetch latest students
      
      let csvContent = "data:text/csv;charset=utf-8,Name,Register Number,Department,Year,LeetCode Username,Total Solved\n";
      
      students.forEach(s => {
        const row = [
          `"${s.name}"`,
          `"${s.registerNumber}"`,
          `"${s.department || ''}"`,
          `"${s.academicYear || ''}"`,
          `"${s.leetCodeUsername || 'Not Linked'}"`,
          s.totalSolved || 0
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `student_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Report downloaded successfully", { id: toastId });
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
      const data = await getDashboardOverview();
      setOverview(data);
    } catch (error: any) {
      toast.error("Failed to load dashboard data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalStudents = overview?.totalStudents || 0;
  const totalStaff = overview?.activeStaff || 0; 
  const activeToday = 0;
  const presentToday = overview?.presentStudents || 0;
  const absentToday = overview?.absentStudents || 0;
  
  const assignedStudents = overview?.assignedStudents || 0;
  const unassignedStudents = overview?.unassignedStudents || 0;
  
  const totalTasks = overview?.totalTasks || 0;
  const completedTasks = overview?.completedTasks || 0;
  const pendingTasks = overview?.pendingTasks || 0;
  
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
              <p className="text-[10px] text-ink-500 uppercase">This Week</p>
              <p className="text-sm font-semibold text-cream-100">{payload[0].value} Active</p>
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
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Overview</h1>
          <p className="text-ink-600 text-sm mt-1">Track system performance and student engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportReport} className="px-4 py-2 bg-cream-100 border border-stone-200 text-ink-600 text-sm font-medium rounded-lg hover:bg-cream-200 transition-colors shadow-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-stagger">
        <StatCard title="Total Students" value={totalStudents} icon={Users} trend="up" trendValue="12" colorClass={{ bg: "bg-sapphire-100", text: "text-sapphire-800" }} />
        <StatCard title="Active Staff" value={totalStaff} icon={UserCheck} colorClass={{ bg: "bg-cream-200", text: "text-ink-900" }} />
        <StatCard title="Present Today" value={presentToday} icon={Activity} trend="up" trendValue="4.2" colorClass={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
        <StatCard title="Absent Today" value={absentToday} icon={UserX} trend="down" trendValue="1.5" colorClass={{ bg: "bg-rose-50", text: "text-rose-600" }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5 animate-stagger">
        <StatCard title="Assigned Students" value={assignedStudents} icon={UserCheck} colorClass={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
        <StatCard title="Unassigned Students" value={unassignedStudents} icon={UserX} colorClass={{ bg: "bg-rose-50", text: "text-rose-600" }} />
        <StatCard title="Total Tasks" value={totalTasks} icon={Target} colorClass={{ bg: "bg-sapphire-100", text: "text-sapphire-800" }} />
        <StatCard title="Completed Tasks" value={completedTasks} icon={Trophy} colorClass={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
        <StatCard title="Pending Tasks" value={pendingTasks} icon={Activity} colorClass={{ bg: "bg-gold-50", text: "text-gold-600" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-stagger">
        {/* Left Side: Charts & Graph (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Chart */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-ink-900">Engagement Overview</h2>
                <p className="text-xs text-ink-600">Active students completing daily targets</p>
              </div>
              <select className="text-xs bg-cream-200 border border-stone-200 text-ink-600 rounded-md px-2 py-1 outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
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

        {/* Right Side: LeetCode Stats */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-gold-100 rounded-md">
                <Code2 className="w-4 h-4 text-gold-700" />
              </div>
              <h2 className="text-base font-semibold text-ink-900">LeetCode Pulse</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-cream-200 border border-stone-200">
                <p className="text-[11px] font-medium text-ink-600 uppercase tracking-wider mb-1">Total Solved</p>
                <p className="text-2xl font-semibold text-ink-900">{totalSolved}</p>
              </div>
              <div className="p-4 rounded-xl bg-cream-200 border border-stone-200">
                <p className="text-[11px] font-medium text-ink-600 uppercase tracking-wider mb-1">Completion</p>
                <p className="text-2xl font-semibold text-ink-900">{completionPercentage}%</p>
              </div>
            </div>

            <div className="space-y-5 flex-1">
              <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider">Difficulty Distribution</h3>
              
              <div className="space-y-4">
                <div className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-ink-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Easy
                    </span>
                    <span className="font-semibold text-ink-900">{easySolved}</span>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 group-hover:opacity-80" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-ink-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gold-500"></span> Medium
                    </span>
                    <span className="font-semibold text-ink-900">{mediumSolved}</span>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gold-500 h-1.5 rounded-full transition-all duration-1000 group-hover:opacity-80" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-ink-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> Hard
                    </span>
                    <span className="font-semibold text-ink-900">{hardSolved}</span>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-1000 group-hover:opacity-80" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button onClick={() => navigate('/admin/performance')} className="mt-6 w-full py-2.5 bg-cream-200 hover:bg-cream-300 text-ink-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              View Detailed Analytics <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

