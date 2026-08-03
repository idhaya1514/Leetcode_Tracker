import { useState, useEffect } from "react";
import { CheckSquare, CheckCircle2, Clock, Code2 } from "lucide-react";
import { useOutletContext } from "react-router";
import { getStudentTasks, markTaskComplete } from "../../services/api";

export default function StudentTasks() {
  const { student } = useOutletContext<{ student: any }>();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (student?.registerNumber) {
      loadTasks();
    }
  }, [student]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await getStudentTasks(student.registerNumber);
      // Filter tasks that are type PROBLEM
      const problemTasks = data.filter((t: any) => t.task?.taskType === "PROBLEM");
      setTasks(problemTasks);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading your tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center animate-in fade-in duration-500">
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 max-w-lg mx-auto mt-12">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800">No Tasks Assigned</h2>
          <p className="text-slate-500 mt-2">You don't have any specific problem tasks assigned right now. Enjoy your free time!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" /> Assigned Tasks
          </h1>
          <p className="text-slate-500 text-sm mt-1">View and complete specific LeetCode problems assigned to you.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {tasks.map((assignment) => {
          const task = assignment.task;
          const isCompleted = assignment.status === "COMPLETED";
          const isOverdue = assignment.status === "OVERDUE";
          
          return (
            <div key={assignment.id} className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-slate-300 transition-colors">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                    isCompleted ? 'bg-emerald-50 text-emerald-600' :
                    isOverdue ? 'bg-rose-50 text-rose-600' :
                    'bg-indigo-50 text-indigo-600'
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

                {task.leetcodeUrl && (
                  <div className="mt-4 flex gap-3">
                    <a 
                      href={task.leetcodeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition-colors"
                    >
                      <Code2 className="w-4 h-4 text-orange-500" />
                      Solve on LeetCode
                    </a>
                    {!isCompleted && (
                      <button 
                        onClick={async () => {
                          try {
                            await markTaskComplete(assignment.id);
                            loadTasks();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-200 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Solved
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-6 md:w-64 flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-slate-100">
                {isCompleted ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-emerald-700 font-bold">Completed</p>
                      {assignment.completedAt && (
                        <p className="text-xs text-emerald-600/70 mt-1">on {new Date(assignment.completedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <p className="text-sm font-medium text-slate-500">Status</p>
                    <div className="w-full py-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 font-semibold text-sm">
                      Pending Sync
                    </div>
                    <p className="text-[10px] text-slate-400 max-w-[150px] leading-relaxed">
                      Complete this on LeetCode. Progress will sync automatically.
                    </p>
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

