import { useState, useEffect } from "react";
import { CheckSquare, Calendar, Target, Plus, Search, Trash2, Tag, Hash, AlignLeft, AlertCircle, Loader2, BarChart2 } from "lucide-react";
import { API_BASE_URL } from "../constants";
import { toast } from "sonner";

export default function StaffTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"TARGET" | "PROBLEM">("TARGET");
  
  const [newTask, setNewTask] = useState({
    title: "",
    leetcodeProblem: "",
    difficulty: "Easy",
    topic: "",
    targetEasy: 0,
    targetMedium: 0,
    targetHard: 0,
    dueDate: new Date().toISOString().split('T')[0]
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "PROBLEM" && (!newTask.title || !newTask.leetcodeProblem)) {
      toast.error("Title and Problem Number are required!");
      return;
    }

    if (activeTab === "TARGET" && newTask.targetEasy === 0 && newTask.targetMedium === 0 && newTask.targetHard === 0) {
      toast.error("Please set at least one target!");
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        ...newTask,
        taskType: activeTab,
        title: activeTab === "TARGET" ? "Daily Target" : newTask.title
      };

      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to assign task");
      
      toast.success("Task assigned successfully!");
      fetchTasks();
      setIsAssigning(false);
      setNewTask({
        title: "",
        leetcodeProblem: "",
        difficulty: "Easy",
        topic: "",
        targetEasy: 0,
        targetMedium: 0,
        targetHard: 0,
        dueDate: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      toast.error("Error creating task");
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === "Easy") return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (diff === "Medium") return "text-orange-700 bg-orange-50 border-orange-200";
    if (diff === "Hard") return "text-rose-700 bg-rose-50 border-rose-200";
    return "text-slate-700 bg-slate-50 border-slate-200";
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" /> Task Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Assign daily targets or specific LeetCode problems.</p>
        </div>
        <button 
          onClick={() => setIsAssigning(!isAssigning)} 
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Assign New Task
        </button>
      </div>

      {/* Assignment Form */}
      {isAssigning && (
        <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-6 relative">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Create Assignment</h2>
              <p className="text-xs text-slate-500">Choose between setting target counts or assigning a specific problem.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 relative z-10 p-1 bg-slate-100 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab("TARGET")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "TARGET" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
            >
              <BarChart2 className="w-4 h-4" /> Daily Targets
            </button>
            <button
              onClick={() => setActiveTab("PROBLEM")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "PROBLEM" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
            >
              <Hash className="w-4 h-4" /> Specific Problem
            </button>
          </div>
          
          <form onSubmit={handleAssign} className="relative">
            {activeTab === "TARGET" ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due Date
                  </label>
                  <input 
                    type="date" 
                    value={newTask.dueDate} 
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">Easy Target</label>
                  <input 
                    type="number" min="0" 
                    value={newTask.targetEasy} 
                    onChange={(e) => setNewTask({...newTask, targetEasy: parseInt(e.target.value) || 0})} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-orange-600 uppercase tracking-wider mb-2">Medium Target</label>
                  <input 
                    type="number" min="0" 
                    value={newTask.targetMedium} 
                    onChange={(e) => setNewTask({...newTask, targetMedium: parseInt(e.target.value) || 0})} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-600 uppercase tracking-wider mb-2">Hard Target</label>
                  <input 
                    type="number" min="0" 
                    value={newTask.targetHard} 
                    onChange={(e) => setNewTask({...newTask, targetHard: parseInt(e.target.value) || 0})} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-semibold" 
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlignLeft className="w-3.5 h-3.5" /> Task Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Two Sum"
                    value={newTask.title} 
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" 
                  />
                </div>
                
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" /> Problem Number
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1"
                    value={newTask.leetcodeProblem} 
                    onChange={(e) => setNewTask({...newTask, leetcodeProblem: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Difficulty
                  </label>
                  <select
                    value={newTask.difficulty}
                    onChange={(e) => setNewTask({...newTask, difficulty: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Topic
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Arrays"
                    value={newTask.topic} 
                    onChange={(e) => setNewTask({...newTask, topic: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[12px] font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due Date
                  </label>
                  <input 
                    type="date" 
                    value={newTask.dueDate} 
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" 
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsAssigning(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm">Cancel</button>
              <button disabled={submitting} type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Publish Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task History Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" /> Assignment History
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No tasks assigned yet. Click "Assign New Task" to create one.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type / Details</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Task Info</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      {task.taskType === "TARGET" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <BarChart2 className="w-3.5 h-3.5" /> Daily Target
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                          <Hash className="w-3.5 h-3.5" /> Specific Problem
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {task.taskType === "TARGET" ? (
                        <div className="flex gap-2 text-xs font-bold">
                          {task.targetEasy > 0 && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">{task.targetEasy} Easy</span>}
                          {task.targetMedium > 0 && <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">{task.targetMedium} Med</span>}
                          {task.targetHard > 0 && <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100">{task.targetHard} Hard</span>}
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800">{task.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">#{task.leetcodeProblem}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(task.difficulty)}`}>
                              {task.difficulty}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => {}}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
