import { useState, useEffect } from "react";
import { FileText, Download, Calendar, Target, Trophy, Activity, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { useOutletContext } from "react-router";
import { fetchStudentDashboardData } from "../../services/api";
import { toast } from "sonner";

export default function StudentReports() {
  const { student } = useOutletContext<{ student: any }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (student?.registerNumber) {
      loadData();
    }
  }, [student]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const dbData = await fetchStudentDashboardData(student.registerNumber);
      setData(dbData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-stone-500">Generating report...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-stone-500">No report data available.</div>;
  }

  const leetStats = data.leetCodeProfile || {};
  const totalDays = data.attendanceRecords?.length || 0;
  const presentDays = data.attendanceRecords?.filter((r: any) => r.status === "PRESENT").length || 0;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
  
  const tasks = data.taskAssignments || [];
  const completedTasks = tasks.filter((t: any) => t.status === "COMPLETED").length;
  const overdueTasks = tasks.filter((t: any) => t.status === "OVERDUE").length;
  const pendingTasks = tasks.filter((t: any) => t.status === "PENDING").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-ink-900 tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-sapphire-600" /> Academic & Performance Report
          </h1>
          <p className="text-stone-500 text-sm mt-1">Comprehensive overview of your activities, tasks, and coding progress.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white border border-stone-200 hover:bg-stone-50 text-ink-900 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm print:hidden"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="glass-panel p-6 rounded-2xl border border-stone-200/60 shadow-sm col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sapphire-500" /> Attendance
            </h3>
          </div>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-4xl font-black text-ink-900">{attendanceRate}%</span>
            <span className="text-sm font-medium text-stone-500 mb-1">Overall Rate</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-500">Total Working Days</span>
              <span className="font-bold text-ink-900">{totalDays}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-500">Days Present</span>
              <span className="font-bold text-emerald-600">{presentDays}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-500">Days Absent</span>
              <span className="font-bold text-rose-600">{totalDays - presentDays}</span>
            </div>
          </div>
        </div>

        {/* Task Completion */}
        <div className="glass-panel p-6 rounded-2xl border border-stone-200/60 shadow-sm col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-500" /> Task Management
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex justify-between items-start mb-2">
                 <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                 <span className="text-2xl font-black text-emerald-700">{completedTasks}</span>
              </div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex justify-between items-start mb-2">
                 <Activity className="w-5 h-5 text-amber-600" />
                 <span className="text-2xl font-black text-amber-700">{pendingTasks}</span>
              </div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div className="flex justify-between items-start mb-2">
                 <XCircle className="w-5 h-5 text-rose-600" />
                 <span className="text-2xl font-black text-rose-700">{overdueTasks}</span>
              </div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Overdue</p>
            </div>
          </div>
          
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden flex">
            {tasks.length > 0 ? (
              <>
                <div style={{ width: `${(completedTasks / tasks.length) * 100}%` }} className="bg-emerald-500 h-full"></div>
                <div style={{ width: `${(pendingTasks / tasks.length) * 100}%` }} className="bg-amber-400 h-full"></div>
                <div style={{ width: `${(overdueTasks / tasks.length) * 100}%` }} className="bg-rose-500 h-full"></div>
              </>
            ) : (
              <div className="w-full bg-stone-200 h-full"></div>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-2 text-center">Task Distribution Completion Bar</p>
        </div>

        {/* LeetCode Summary */}
        <div className="glass-panel p-6 rounded-2xl border border-stone-200/60 shadow-sm col-span-1 md:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-gold-500" /> LeetCode Achievement Summary
            </h3>
          </div>
          
          {!student.leetCodeUsername ? (
             <div className="text-center p-8 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-stone-500 text-sm">No LeetCode account linked. Stats unavailable.</p>
             </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Total Solved</span>
                <span className="text-4xl font-black text-ink-900">{leetStats.totalSolved || 0}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border-l border-stone-100">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Easy</span>
                <span className="text-3xl font-black text-emerald-500">{leetStats.easySolved || 0}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border-l border-stone-100">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Medium</span>
                <span className="text-3xl font-black text-amber-500">{leetStats.mediumSolved || 0}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border-l border-stone-100">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Hard</span>
                <span className="text-3xl font-black text-rose-500">{leetStats.hardSolved || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

