import React, { useState, useEffect } from "react";
import {
  User, Mail, Phone, Hash, BookOpen, Code2, Trophy, Loader2,
  Calendar, CheckCircle, Zap, Flame, BarChart3, AlertCircle,
  ExternalLink, ListTodo, Target, TrendingUp, Bell, Clock,
  ChevronRight, MoreHorizontal, Activity, ArrowRight, Play, Eye
} from "lucide-react";
import { fetchStudentDashboardData, fetchLeetCodeStats, updateMobileNumber, LeetCodeStats, syncLeetCodeTaskProgress, markTaskComplete } from "../../services/api";
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

const PREMIUM_CARD = "glass-panel p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-sapphire-900/5 hover:-translate-y-1 rounded-2xl";

export default function StudentDashboard({ student }: StudentDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [leetStats, setLeetStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const res = await syncLeetCodeTaskProgress(student.registerNumber);
      toast.success(res.message);
      if (res.completed > 0) {
         loadDashboard(); // Refresh data
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync LeetCode progress");
    } finally {
      setIsSyncing(false);
    }
  };

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
        <Loader2 className="w-8 h-8 animate-spin text-sapphire-800" />
      </div>
    );
  }

  // Derived Stats
  const totalSolved = leetStats?.totalSolved || data?.leetCodeProfile?.totalSolved || 0;
  const easySolved = leetStats?.easySolved || data?.leetCodeProfile?.easySolved || 0;
  const mediumSolved = leetStats?.mediumSolved || data?.leetCodeProfile?.mediumSolved || 0;
  const hardSolved = leetStats?.hardSolved || data?.leetCodeProfile?.hardSolved || 0;
  
  const streak = leetStats?.streak || 0;
  
  const history = data?.dailyProgressHistory || [];
  let calculatedSolvedToday = 0;
  if (history.length > 0) {
    const todayData = history.find((h: any) => new Date(h.date).toDateString() === new Date().toDateString());
    const yesterdayData = history.find((h: any) => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return new Date(h.date).toDateString() === d.toDateString();
    });
    if (todayData && yesterdayData) {
      calculatedSolvedToday = Math.max(0, todayData.totalSolved - yesterdayData.totalSolved);
    } else if (todayData) {
      calculatedSolvedToday = 0;
    }
  }

  const solvedToday = leetStats?.solvedToday || calculatedSolvedToday;
  const weeklyProgress = leetStats?.weeklyProgress || 0;
  const monthlyProgress = leetStats?.monthlyProgress || 0;

  const totalDays = data?.attendanceRecords?.length || 0;
  const presentDays = data?.attendanceRecords?.filter((r: any) => r.status === "PRESENT").length || 0;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  const pendingTasks = data?.taskAssignments?.filter((a: any) => a.status !== "COMPLETED") || [];
  const completedTasks = data?.taskAssignments?.filter((a: any) => a.status === "COMPLETED") || [];

  const allTasks = [...pendingTasks, ...completedTasks];
  const latestTargetTask = allTasks.find(a => a.task?.taskType === "TARGET")?.task;
  const targetGoal = latestTargetTask ? 
    (latestTargetTask.targetEasy + latestTargetTask.targetMedium + latestTargetTask.targetHard) 
    : 5;

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
  const KPICard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className={PREMIUM_CARD + " group"}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-ink-600 uppercase tracking-wide">{title}</h3>
        <div className={`p-2 rounded-lg transition-colors ${bg} group-hover:bg-cream-100`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <div className="text-2xl font-black text-ink-900 tracking-tight">{value}</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sapphire-800 to-sapphire-900 rounded-2xl p-8 text-cream-100 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-cream-100">Welcome back, {data?.name || student.name}! 👋</h1>
            <p className="text-sapphire-100 text-lg">
              {streak > 0 ? `Keep up the great work. You're on a ${streak}-day coding streak!` : 'Start solving problems today to build your streak!'}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 text-center min-w-[120px] border border-white/10">
              <div className="text-3xl font-bold text-cream-100">{totalSolved}</div>
              <div className="text-sapphire-100 text-sm mt-1">Total Solved</div>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 text-center min-w-[120px] border border-white/10">
              <div className="text-3xl font-bold flex items-center justify-center gap-1 text-cream-100">
                {streak} <Flame className="w-5 h-5 text-gold-500 fill-gold-500" />
              </div>
              <div className="text-sapphire-100 text-sm mt-1">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 animate-stagger">
        <KPICard title="Total Solved" value={totalSolved} icon={Code2} color="text-sapphire-800" bg="bg-sapphire-100" />
        <KPICard title="Solved Today" value={solvedToday} icon={Zap} color="text-gold-600" bg="bg-gold-50" />
        <KPICard title="Weekly Solved" value={weeklyProgress} icon={TrendingUp} color="text-sapphire-600" bg="bg-sapphire-50" />
        <KPICard title="Pending Tasks" value={pendingTasks.length} icon={CheckCircle} color="text-rose-500" bg="bg-rose-50" />
        <KPICard title="Completed Tasks" value={completedTasks.length} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-50" />
        
        {/* Daily Target Progress */}
        <div className={`${PREMIUM_CARD} col-span-2 md:col-span-1 flex flex-col justify-center items-center text-center bg-gradient-to-br from-ink-900 to-ink-800 text-cream-100 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Target className="w-16 h-16" />
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-sm font-medium text-stone-300 mb-4">Daily Target</h3>
            <div className="flex justify-center mb-2">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-ink-700" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175" strokeDashoffset={175 - (175 * Math.min(solvedToday, targetGoal) / targetGoal)} className="text-sapphire-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold">{Math.min(solvedToday, targetGoal)}</span>
                  <span className="text-[9px] text-stone-400 -mt-1">/ {targetGoal}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-2">
              {solvedToday >= targetGoal ? 'Target Achieved! 🏆' : `${targetGoal - solvedToday} more to go!`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 animate-stagger">
        
        {/* Main Content Area */}
        <div className="space-y-6">
          
          {/* Today's Tasks Table */}
          <div className={`${PREMIUM_CARD} !p-0`}>
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink-900">Today's Tasks</h3>
                <p className="text-sm text-ink-600 mt-1">Pending assignments from your faculty</p>
              </div>
              <button className="text-sm font-medium text-sapphire-800 hover:text-sapphire-900 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream-200 border-b border-stone-200 text-xs uppercase tracking-wider text-ink-600 font-semibold">
                    <th className="p-4 pl-6">Task Name</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {pendingTasks.slice(0, 4).map((assignment: any, idx: number) => {
                    const task = assignment.task || {};
                    
                    if (task.taskType === "TARGET") {
                      return (
                        <tr key={idx} className="hover:bg-cream-200/50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="font-medium text-ink-900">Daily Target</div>
                            <div className="text-xs text-ink-600 mt-0.5">Solve a specific number of problems</div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {task.targetEasy > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{task.targetEasy} Easy</span>}
                              {task.targetMedium > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100">{task.targetMedium} Med</span>}
                              {task.targetHard > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">{task.targetHard} Hard</span>}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-sm text-ink-600">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cream-100 border border-stone-200 rounded-lg text-sm font-medium text-ink-900 hover:bg-cream-200 hover:text-sapphire-800 transition-colors shadow-sm">
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
                    <tr key={idx} className="hover:bg-cream-200/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-medium text-ink-900">{task.title || `Task #${task.id}`} {task.leetcodeProblem ? `(#${task.leetcodeProblem})` : ''}</div>
                        <div className="text-xs text-ink-600 mt-0.5">{task.topic || 'Specific Problem'}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${diffColor}`}>
                          {task.difficulty || 'Easy'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-ink-600">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <a href={task.leetcodeUrl || `https://leetcode.com/problems/${task.leetcodeProblem || ''}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cream-100 border border-stone-200 rounded-lg text-sm font-medium text-ink-900 hover:bg-cream-200 hover:text-sapphire-800 transition-colors shadow-sm">
                            <Play className="w-3.5 h-3.5" /> Solve
                          </a>
                          <button onClick={async () => {
                            try {
                              await markTaskComplete(assignment.id);
                              toast.success("Task marked as complete!");
                              loadDashboard();
                            } catch(err) {
                              toast.error("Failed to mark as complete");
                            }
                          }} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5" /> Mark
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                  {pendingTasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-ink-600">
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
            <div className={`${PREMIUM_CARD}`}>
              <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sapphire-600" /> Weekly Activity
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c4bcb0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a09588' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a09588' }} />
                    <Tooltip cursor={{ fill: '#e2ddd6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="solved" fill="#263545" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Coding Strength */}
            <div className={`${PREMIUM_CARD}`}>
              <h3 className="text-lg font-bold text-ink-900 mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sapphire-800" /> Coding Strength
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#c4bcb0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a09588', fontSize: 11 }} />
                    <Radar name="Strength" dataKey="A" stroke="#263545" fill="#263545" fillOpacity={0.2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>
        </div>


      </div>
      
      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-stone-400 border-t border-stone-200 pt-8 pb-4">
        Copyright © {new Date().getFullYear()} SSCET LeetCode Tracker | Student Performance Monitoring System
      </footer>

    </div>
  );
}

