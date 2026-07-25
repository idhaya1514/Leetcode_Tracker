import { useState, useEffect } from "react";
import { Target, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useOutletContext } from "react-router";
import { getStudentTasks } from "../../services/api";

export default function StudentDailyTarget() {
  const { student } = useOutletContext<{ student: any }>();
  const [targets, setTargets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (student) {
      loadTargets();
    }
    
    // Safety timeout in case backend hangs
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [student]);

  const loadTargets = async () => {
    setIsLoading(true);
    try {
      const data = await getStudentTasks(student.registerNumber);
      // Filter only tasks that are type TARGET
      const targetTasks = data.filter((t: any) => t.task?.taskType === "TARGET");
      setTargets(targetTasks);
    } catch (error) {
      console.error("Failed to load targets", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse mt-6">
        <div className="h-10 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="h-40 bg-slate-200 rounded-xl w-full"></div>
        <div className="h-40 bg-slate-200 rounded-xl w-full"></div>
      </div>
    );
  }

  if (targets.length === 0) {
    return (
      <div className="p-8 text-center animate-in fade-in duration-500">
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 max-w-lg mx-auto mt-12">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800">No Targets Assigned</h2>
          <p className="text-slate-500 mt-2">You don't have any daily targets assigned right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" /> Daily Target
          </h1>
          <p className="text-slate-500 text-sm mt-1">View and complete your assigned daily targets.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {targets.map((assignment) => {
          const task = assignment.task;
          const isCompleted = assignment.status === "COMPLETED";
          const isOverdue = assignment.status === "OVERDUE";
          
          return (
            <div key={assignment.id} className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                    isCompleted ? 'bg-emerald-50 text-emerald-600' :
                    isOverdue ? 'bg-rose-50 text-rose-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {assignment.status}
                  </span>
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-800">{task.title}</h3>
                {task.description && (
                  <p className="text-slate-500 text-sm mt-2">{task.description}</p>
                )}

                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Easy Target</span>
                    <span className="text-2xl font-black text-emerald-500">{task.targetEasy || 0}</span>
                  </div>
                  <div className="w-px bg-slate-100"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Medium Target</span>
                    <span className="text-2xl font-black text-amber-500">{task.targetMedium || 0}</span>
                  </div>
                  <div className="w-px bg-slate-100"></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Hard Target</span>
                    <span className="text-2xl font-black text-rose-500">{task.targetHard || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:w-1/3 bg-slate-50/50 flex flex-col justify-center space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigned By</p>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                    {task.createdByRole === 'ADMIN' ? (
                      <span className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">A</span>
                    ) : (
                      <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">S</span>
                    )}
                    {task.createdByName || 'System'}
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{task.createdByRole}</span>
                  </p>
                </div>
                
                {isCompleted ? (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-semibold">Target Achieved!</span>
                  </div>
                ) : isOverdue ? (
                  <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Target Overdue</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-semibold">In Progress</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

