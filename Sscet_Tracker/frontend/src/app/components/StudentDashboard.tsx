import React, { useState, useEffect } from "react";
import {
  User, Mail, Phone, Hash, BookOpen, Code2, Trophy, Loader2,
  Calendar, CheckCircle, Zap, Flame, BarChart3, AlertCircle,
  ExternalLink, ListTodo, Target, TrendingUp, Bell, Clock,
  ChevronRight, MoreHorizontal, Activity, ArrowRight, Play, Eye
} from "lucide-react";
import { fetchStudentDashboardData, fetchLeetCodeStats, updateMobileNumber, LeetCodeStats } from "../services/api";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface StudentDashboardProps {
  student: {
    name: string;
    registerNumber: string;
    department: string;
    email?: string;
    leetCodeUsername?: string;
  };
}

const PREMIUM_CARD = "bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

export default function StudentDashboard({ student }: StudentDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [leetStats, setLeetStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dbData = await fetchStudentDashboardData(student.registerNumber);
      setData(dbData);

      if (dbData.leetCodeProfile?.username) {
        const stats = await fetchLeetCodeStats(dbData.leetCodeProfile.username, true);
        setLeetStats(stats);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Derived Stats
  const totalSolved = leetStats?.totalSolved || data?.leetCodeProfile?.totalSolved || 0;
  const easySolved = leetStats?.easySolved || data?.leetCodeProfile?.easySolved || 0;
  const mediumSolved = leetStats?.mediumSolved || data?.leetCodeProfile?.mediumSolved || 0;
  const hardSolved = leetStats?.hardSolved || data?.leetCodeProfile?.hardSolved || 0;
  
  const streak = leetStats?.streak || 0;
  const solvedToday = leetStats?.solvedToday || 0;
  const weeklyProgress = leetStats?.weeklyProgress || 0;
  const monthlyProgress = leetStats?.monthlyProgress || 0;

  const totalDays = data?.attendanceRecords?.length || 0;
  const presentDays = data?.attendanceRecords?.filter((r: any) => r.status === "PRESENT").length || 0;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  const pendingTasks = data?.assignments?.filter((a: any) => 
    !data.taskSubmissions?.some((s: any) => s.taskId === a.taskId && s.status === "COMPLETED")
  ) || [];
  
  const completedTasks = data?.taskSubmissions?.filter((s: any) => s.status === "COMPLETED") || [];

  const difficultyData = [
    { name: 'Easy', value: easySolved, color: '#10b981' },
    { name: 'Medium', value: mediumSolved, color: '#f59e0b' },
    { name: 'Hard', value: hardSolved, color: '#ef4444' },
  ];

  const weeklyData = leetStats?.weeklyChartData || [
    { name: 'Mon', solved: 0 },
    { name: 'Tue', solved: 0 },
    { name: 'Wed', solved: 0 },
    { name: 'Thu', solved: 0 },
    { name: 'Fri', solved: 0 },
    { name: 'Sat', solved: 0 },
    { name: 'Sun', solved: 0 },
  ];

  const radarData = [
    { subject: 'Arrays', A: 80, fullMark: 100 },
    { subject: 'Strings', A: 90, fullMark: 100 },
    { subject: 'DP', A: 60, fullMark: 100 },
    { subject: 'Graphs', A: 70, fullMark: 100 },
    { subject: 'Math', A: 85, fullMark: 100 },
    { subject: 'Trees', A: 65, fullMark: 100 },
  ];

  const KPICard = ({ title, value, icon: Icon, color, bg, subtitle }: any) => (
    <div className={`${PREMIUM_CARD} p-5 flex flex-col justify-between group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">All Time</span>
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">{value}</span>
          {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {data?.name || student.name}! 👋</h1>
            <p className="text-blue-100 text-lg">
              {streak > 0 ? `Keep up the great work. You're on a ${streak}-day coding streak!` : 'Start solving problems today to build your streak!'}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 text-center min-w-[120px] border border-white/10">
              <div className="text-3xl font-bold">{totalSolved}</div>
              <div className="text-blue-100 text-sm mt-1">Total Solved</div>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 text-center min-w-[120px] border border-white/10">
              <div className="text-3xl font-bold flex items-center justify-center gap-1">
                {streak} <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
              </div>
              <div className="text-blue-100 text-sm mt-1">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Total Solved" value={totalSolved} icon={Code2} color="text-indigo-500" bg="bg-indigo-50" />
        <KPICard title="Solved Today" value={solvedToday} icon={Zap} color="text-amber-500" bg="bg-amber-50" />
        <KPICard title="Weekly Solved" value={weeklyProgress} icon={TrendingUp} color="text-blue-500" bg="bg-blue-50" />
        <KPICard title="Pending Tasks" value={pendingTasks.length} icon={ListTodo} color="text-rose-500" bg="bg-rose-50" />
        <KPICard title="Completed Tasks" value={completedTasks.length} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-50" />
        
        {/* Daily Target Progress */}
        <div className={`${PREMIUM_CARD} p-5 col-span-2 md:col-span-1 flex flex-col justify-center items-center text-center bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Target className="w-16 h-16" />
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Daily Target</h3>
            <div className="flex justify-center mb-2">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175" strokeDashoffset={175 - (175 * Math.min(solvedToday, 5) / 5)} className="text-blue-400 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold">{Math.min(solvedToday, 5)}</span>
                  <span className="text-[9px] text-slate-400 -mt-1">/ 5</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {solvedToday >= 5 ? 'Target Achieved! 🏆' : `${5 - solvedToday} more to go!`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Tasks & Data */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Today's Tasks Table */}
          <div className={`${PREMIUM_CARD}`}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Today's Tasks</h3>
                <p className="text-sm text-slate-500 mt-1">Pending assignments from your faculty</p>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="p-4 pl-6">Task Name</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingTasks.slice(0, 4).map((assignment: any, idx: number) => {
                    const task = assignment.task || {};
                    
                    if (task.taskType === "TARGET") {
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="font-medium text-slate-800">Daily Target</div>
                            <div className="text-xs text-slate-500 mt-0.5">Solve a specific number of problems</div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {task.targetEasy > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{task.targetEasy} Easy</span>}
                              {task.targetMedium > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100">{task.targetMedium} Med</span>}
                              {task.targetHard > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">{task.targetHard} Hard</span>}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
                              <Play className="w-3.5 h-3.5" /> Start
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    // PROBLEM type assignment
                    const diffColor = task.difficulty === 'Hard' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                      task.difficulty === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                      'bg-emerald-50 text-emerald-600 border-emerald-200';
                    return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-medium text-slate-800">{task.title || `Task #${task.id}`} {task.leetcodeProblem ? `(#${task.leetcodeProblem})` : ''}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{task.topic || 'Specific Problem'}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${diffColor}`}>
                          {task.difficulty || 'Easy'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
                          <Play className="w-3.5 h-3.5" /> Solve
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                  {pendingTasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                        <p className="font-medium">All caught up!</p>
                        <p className="text-sm mt-1">You have no pending tasks for today.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Dashboard Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Weekly Activity */}
            <div className={`${PREMIUM_CARD} p-6`}>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" /> Weekly Activity
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="solved" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Coding Strength */}
            <div className={`${PREMIUM_CARD} p-6`}>
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Coding Strength
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Radar name="Strength" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>
        </div>

        {/* Right Column: Profile & Notifications */}
        <div className="space-y-6">
          
          {/* LeetCode Performance */}
          <div className={`${PREMIUM_CARD}`}>
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-orange-500" /> LeetCode Performance
              </h3>
            </div>
            <div className="p-6">
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-slate-50 overflow-hidden shadow-sm">
                  <img src={leetStats?.avatar || "https://assets.leetcode.com/users/default_avatar.png"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{leetStats?.realName || student.name}</h4>
                  <p className="text-sm text-slate-500">@{leetStats?.username || student.leetCodeUsername}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">Global Ranking</div>
                  <div className="font-bold text-slate-800">#{leetStats?.ranking?.toLocaleString() || 'N/A'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">Acceptance Rate</div>
                  <div className="font-bold text-slate-800">{leetStats?.acceptanceRate || '65.4'}%</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-emerald-600 font-medium">Easy</span>
                    <span className="text-slate-600 font-medium">{easySolved} <span className="text-slate-400">/ {leetStats?.totalEasy || 700}</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min((easySolved / (leetStats?.totalEasy || 700)) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-amber-500 font-medium">Medium</span>
                    <span className="text-slate-600 font-medium">{mediumSolved} <span className="text-slate-400">/ {leetStats?.totalMedium || 1500}</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${Math.min((mediumSolved / (leetStats?.totalMedium || 1500)) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-rose-500 font-medium">Hard</span>
                    <span className="text-slate-600 font-medium">{hardSolved} <span className="text-slate-400">/ {leetStats?.totalHard || 600}</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${Math.min((hardSolved / (leetStats?.totalHard || 600)) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Submission Heatmap (Simulated)</div>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${Math.random() > 0.7 ? 'bg-emerald-400' : Math.random() > 0.4 ? 'bg-emerald-200' : 'bg-slate-100'}`}></div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className={`${PREMIUM_CARD}`}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" /> Notifications
              </h3>
            </div>
            <div className="p-6">
              <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
                
                <div className="relative">
                  <div className="absolute -left-[31px] bg-blue-100 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="text-sm font-medium text-slate-800">New Task Assigned</div>
                  <div className="text-xs text-slate-500 mt-1">Faculty assigned "Two Sum" for today.</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 2 hours ago</div>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[31px] bg-emerald-100 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  </div>
                  <div className="text-sm font-medium text-slate-800">Daily Target Achieved 🏆</div>
                  <div className="text-xs text-slate-500 mt-1">Congratulations! You solved 5 problems today.</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Yesterday</div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] bg-amber-100 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                  </div>
                  <div className="text-sm font-medium text-slate-800">Deadline Approaching</div>
                  <div className="text-xs text-slate-500 mt-1">"Merge Intervals" is due in 3 hours.</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 2 days ago</div>
                </div>

              </div>
              <button className="w-full mt-6 py-2 bg-slate-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
                View All Activity
              </button>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-slate-400 border-t border-slate-200 pt-8 pb-4">
        Copyright © {new Date().getFullYear()} SSCET LeetCode Tracker | Student Performance Monitoring System
      </footer>

    </div>
  );
}
