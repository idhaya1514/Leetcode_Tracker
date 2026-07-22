import { useState } from "react";
import { CheckSquare, Calendar, Target, Plus, Search, Trash2 } from "lucide-react";

export default function StaffTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, date: new Date().toISOString().split('T')[0], easy: 3, medium: 2, hard: 1, status: "Active" },
    { id: 2, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], easy: 2, medium: 1, hard: 0, status: "Completed" },
    { id: 3, date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], easy: 1, medium: 1, hard: 0, status: "Completed" },
  ]);

  const [isAssigning, setIsAssigning] = useState(false);
  const [newTask, setNewTask] = useState({
    date: new Date().toISOString().split('T')[0],
    easy: 0,
    medium: 0,
    hard: 0
  });

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    setTasks([{ id: Date.now(), ...newTask, status: "Active" }, ...tasks]);
    setIsAssigning(false);
    setNewTask({ date: new Date().toISOString().split('T')[0], easy: 0, medium: 0, hard: 0 });
  };

  const handleDelete = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" /> Task Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Assign LeetCode targets for specific dates and view assignment history.</p>
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
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-6 relative">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Create New Assignment</h2>
              <p className="text-xs text-slate-500">Set the daily LeetCode targets for your students.</p>
            </div>
          </div>
          
          <form onSubmit={handleAssign} className="relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Assignment Date</label>
                <input 
                  type="date" 
                  value={newTask.date} 
                  onChange={(e) => setNewTask({...newTask, date: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" 
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">Easy Target</label>
                <input 
                  type="number" min="0" 
                  value={newTask.easy} 
                  onChange={(e) => setNewTask({...newTask, easy: parseInt(e.target.value) || 0})} 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1">Medium Target</label>
                <input 
                  type="number" min="0" 
                  value={newTask.medium} 
                  onChange={(e) => setNewTask({...newTask, medium: parseInt(e.target.value) || 0})} 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1">Hard Target</label>
                <input 
                  type="number" min="0" 
                  value={newTask.hard} 
                  onChange={(e) => setNewTask({...newTask, hard: parseInt(e.target.value) || 0})} 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-semibold" 
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsAssigning(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm">Cancel</button>
              <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20">Publish Task</button>
            </div>
          </form>
        </div>
      )}

      {/* Task History Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" /> Task Assignment History
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search dates..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">LeetCode Target</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-slate-800">{new Date(task.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 text-xs font-bold">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">{task.easy} Easy</span>
                      <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">{task.medium} Med</span>
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100">{task.hard} Hard</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {task.status === "Active" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Active Today
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Completed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(task.id)}
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
        </div>
      </div>
    </div>
  );
}
