import { useState, useEffect } from "react";
import { BarChart3, Calendar, Target, Trophy, Filter, Activity, Clock, Zap } from "lucide-react";
import { useOutletContext } from "react-router";
import { fetchStudentDashboardData } from "../../services/api";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentDailyProgress() {
  const { student } = useOutletContext<{ student: any }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("Today");

  const filterOptions = ["Today", "Last 7 Days", "Last 10 Days", "Last 30 Days", "Last Month", "Last 2 Months"];

  useEffect(() => {
    if (student) {
      loadData();
    }
    
    // Safety timeout in case backend hangs
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [student]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const dbData = await fetchStudentDashboardData(student.registerNumber);
      setData(dbData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load progress data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse mt-6">
        <div className="h-10 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-xl w-full"></div>
      </div>
    );
  }

  // Filter Logic (Mock logic based on full data set, backend should ideally handle this or we filter dates here)
  const leetStats = data?.leetCodeProfile || {};
  let daysToCalculate = 1;
  switch (dateFilter) {
    case "Today": daysToCalculate = 1; break;
    case "Last 7 Days": daysToCalculate = 7; break;
    case "Last 10 Days": daysToCalculate = 10; break;
    case "Last 30 Days": daysToCalculate = 30; break;
    case "Last Month": daysToCalculate = 30; break;
    case "Last 2 Months": daysToCalculate = 60; break;
    default: daysToCalculate = 1;
  }

  const history = data?.dailyProgressHistory || [];
  
  let fEasy = 0;
  let fMedium = 0;
  let fHard = 0;
  let fTotal = 0;

  if (history.length > 0 && daysToCalculate === 1) {
    // Exact today's math
    const todayData = history.find((h: any) => new Date(h.date).toDateString() === new Date().toDateString());
    const yesterdayData = history.find((h: any) => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return new Date(h.date).toDateString() === d.toDateString();
    });

    if (todayData) {
      if (yesterdayData) {
        fEasy = Math.max(0, todayData.easySolved - yesterdayData.easySolved);
        fMedium = Math.max(0, todayData.mediumSolved - yesterdayData.mediumSolved);
        fHard = Math.max(0, todayData.hardSolved - yesterdayData.hardSolved);
        fTotal = Math.max(0, todayData.totalSolved - yesterdayData.totalSolved);
      } else {
        // If no yesterday data, we just assume today is the total (or 0 if we don't want to skew, but for now 0)
        fEasy = 0; fMedium = 0; fHard = 0; fTotal = 0; 
      }
    }
  } else {
    // For other days, just fallback to mockup for now until we have more history
    const factor = daysToCalculate === 1 ? 0 : daysToCalculate === 7 ? 0.15 : daysToCalculate === 30 ? 0.4 : 1;
    fEasy = Math.max(0, Math.round((leetStats.easySolved || 0) * factor));
    fMedium = Math.max(0, Math.round((leetStats.mediumSolved || 0) * factor));
    fHard = Math.max(0, Math.round((leetStats.hardSolved || 0) * factor));
    fTotal = fEasy + fMedium + fHard;
  }
  
  const completionPercentage = fTotal > 0 ? Math.min(100, Math.round((fTotal / (daysToCalculate * 2)) * 100)) : 0;
  const avgPerDay = (fTotal / daysToCalculate).toFixed(1);

  const chartData = [
    { name: "Easy", solved: fEasy, fill: "#10b981" },
    { name: "Medium", solved: fMedium, fill: "#f59e0b" },
    { name: "Hard", solved: fHard, fill: "#ef4444" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" /> Daily Progress
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track your problem-solving consistency over time.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter By</span>
          </div>
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer py-1 pr-2"
          >
            {filterOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm">
          <p className="text-[13px] font-medium text-slate-500 mb-2">Problems Solved</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-indigo-900">{fTotal}</h2>
            <span className="text-xs text-indigo-600 font-medium">in {dateFilter.toLowerCase()}</span>
          </div>
        </div>
        
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-5 shadow-sm">
          <p className="text-[13px] font-medium text-emerald-700 mb-2">Easy</p>
          <h2 className="text-3xl font-bold text-emerald-800">{fEasy}</h2>
        </div>

        <div className="bg-amber-50/50 rounded-xl border border-amber-100 p-5 shadow-sm">
          <p className="text-[13px] font-medium text-amber-700 mb-2">Medium</p>
          <h2 className="text-3xl font-bold text-amber-800">{fMedium}</h2>
        </div>

        <div className="bg-rose-50/50 rounded-xl border border-rose-100 p-5 shadow-sm">
          <p className="text-[13px] font-medium text-rose-700 mb-2">Hard</p>
          <h2 className="text-3xl font-bold text-rose-800">{fHard}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Difficulty Breakdown</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="solved" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Performance Metrics</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" /> Completion Rate
                  </span>
                  <span className="text-lg font-bold text-indigo-900">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${completionPercentage}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Daily Average
                  </span>
                  <span className="text-lg font-bold text-amber-900">{avgPerDay} / day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

