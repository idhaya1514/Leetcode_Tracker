import React, { useState, useEffect, useRef } from "react";
import { CheckSquare, Calendar, Target, Plus, Search, Trash2, Tag, Hash, AlignLeft, AlertCircle, Loader2, BarChart2, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { API_BASE_URL, getStudents, getStaffAssignments, deleteTask } from "../../services/api";
import { toast } from "sonner";

export default function StaffTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"TARGET" | "PROBLEM">("TARGET");

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const isAdmin = sessionStorage.getItem("adminLoggedIn") === "true";
  const currentStaff = JSON.parse(sessionStorage.getItem("currentStaff") || "{}");
  
  const [targetTask, setTargetTask] = useState({
    targetEasy: 0,
    targetMedium: 0,
    targetHard: 0,
    dueDate: new Date().toISOString().split('T')[0]
  });

  const [problemTasks, setProblemTasks] = useState([{
    url: "",
    title: "",
    leetcodeProblem: "",
    difficulty: "Easy",
    topic: "",
    dueDate: new Date().toISOString().split('T')[0]
  }]);

  const [fetchingUrl, setFetchingUrl] = useState<number | null>(null);

  const handleUrlFetch = async (idx: number, url: string) => {
    const newTasks = [...problemTasks];
    newTasks[idx].url = url;
    setProblemTasks(newTasks);

    if (!url) return;
    
    const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
    if (!match) return; 
    
    const titleSlug = match[1];
    
    try {
      setFetchingUrl(idx);
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${titleSlug}`);
      if (res.ok) {
        const data = await res.json();
        setProblemTasks(prev => {
          const updated = [...prev];
          updated[idx].title = data.questionTitle || "";
          updated[idx].leetcodeProblem = data.questionFrontendId || "";
          updated[idx].difficulty = data.difficulty || "Easy";
          updated[idx].topic = data.topicTags && data.topicTags.length > 0 ? data.topicTags.map((t:any) => t.name).join(", ") : "";
          return updated;
        });
        toast.success("Problem details fetched automatically!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingUrl(null);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        let successCount = 0;
        let failCount = 0;
        
        setSubmitting(true);
        
        for (const row of data as any[]) {
          let title = "", problem = "", difficulty = "Easy", topic = "", dueDate = new Date().toISOString().split('T')[0];
          
          for (const key in row) {
            const k = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (k.includes('title') || k.includes('name')) title = String(row[key]).trim();
            if (k.includes('problem') || k.includes('leetcode')) problem = String(row[key]).trim();
            if (k.includes('difficulty')) difficulty = String(row[key]).trim();
            if (k.includes('topic') || k.includes('tag')) topic = String(row[key]).trim();
            if (k.includes('date') || k.includes('due')) {
              const d = new Date(row[key]);
              if (!isNaN(d.getTime())) dueDate = d.toISOString().split('T')[0];
            }
          }
          
          if (!title || !problem) continue; 
          
          const payload = {
            title,
            leetcodeProblem: problem,
            difficulty,
            topic,
            dueDate,
            taskType: "PROBLEM",
            targetEasy: 0,
            targetMedium: 0,
            targetHard: 0,
            createdByRole: isAdmin ? "ADMIN" : "STAFF",
            createdById: isAdmin ? "admin" : currentStaff.staffId,
            createdByName: isAdmin ? "Admin" : currentStaff.name,
            studentIds: students.map(s => s.registerNumber)
          };
          
          try {
            const res = await fetch(`${API_BASE_URL}/tasks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (res.ok) successCount++;
            else failCount++;
          } catch {
            failCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`Successfully imported ${successCount} tasks from file!`);
          fetchTasks();
        } else if (failCount === 0) {
          toast.error("No valid tasks found in file. Ensure 'Title' and 'Problem' columns exist.");
        }
        
        if (failCount > 0) {
          toast.error(`Failed to import ${failCount} tasks.`);
        }
        
      } catch (err) {
        toast.error("Error parsing file. Ensure it is a valid Excel or CSV.");
      } finally {
        setSubmitting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const url = isAdmin ? `${API_BASE_URL}/tasks` : `${API_BASE_URL}/tasks/staff/${currentStaff.staffId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
      
      if (isAdmin) {
        const allStudents = await getStudents();
        setStudents(allStudents);
      } else if (currentStaff.staffId) {
        const assignments = await getStaffAssignments();
        const myAssignments = assignments.filter(a => a.staffId === currentStaff.staffId);
        const allStudents = await getStudents();
        const myStudents = allStudents.filter(s => myAssignments.some(a => a.studentRegisterNumber === s.registerNumber));
        setStudents(myStudents);
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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully!");
      fetchTasks();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task.");
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "PROBLEM") {
      const invalidTasks = problemTasks.filter(pt => !pt.title || !pt.leetcodeProblem);
      if (invalidTasks.length > 0) {
        toast.error("Title and Problem Number are required for all problems!");
        return;
      }
    }

    if (activeTab === "TARGET" && targetTask.targetEasy === 0 && targetTask.targetMedium === 0 && targetTask.targetHard === 0) {
      toast.error("Please set at least one target!");
      return;
    }
    let targetStudents = students.map(s => s.registerNumber);

    if (targetStudents.length === 0) {
      toast.error(isAdmin ? "No students available to assign." : "No assigned students found to receive tasks.");
      return;
    }
    
    setSubmitting(true);
    try {
      const createdByRole = isAdmin ? "ADMIN" : "STAFF";
      const createdById = isAdmin ? "admin" : currentStaff.staffId;
      const createdByName = isAdmin ? "Admin" : currentStaff.name;

      if (activeTab === "TARGET") {
        const payload = {
          ...targetTask,
          taskType: "TARGET",
          title: "Daily Target",
          difficulty: "Mixed",
          leetcodeProblem: "N/A",
          studentIds: targetStudents,
          createdByRole,
          createdById,
          createdByName
        };
        const res = await fetch(`${API_BASE_URL}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to assign target task");
        }
      } else {
        await Promise.all(problemTasks.map(async (pt) => {
          const payload = {
            ...pt,
            taskType: "PROBLEM",
            targetEasy: 0,
            targetMedium: 0,
            targetHard: 0,
            studentIds: targetStudents,
            createdByRole,
            createdById,
            createdByName
          };
          const res = await fetch(`${API_BASE_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error(`Failed to assign problem ${pt.title}`);
        }));
      }
      
      toast.success(activeTab === "TARGET" ? "Target task assigned successfully!" : `${problemTasks.length} problem(s) assigned successfully!`);
      fetchTasks();
      setIsAssigning(false);
      setTargetTask({
        targetEasy: 0,
        targetMedium: 0,
        targetHard: 0,
        dueDate: new Date().toISOString().split('T')[0]
      });
      setProblemTasks([{
        url: "",
        title: "",
        leetcodeProblem: "",
        difficulty: "Easy",
        topic: "",
        dueDate: new Date().toISOString().split('T')[0]
      }]);
      setSelectedStudents([]);
    } catch (err: any) {
      toast.error(err.message || "Error creating task");
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
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-sapphire-600" /> Task Management
          </h1>
          <p className="text-ink-500 text-sm mt-1">Assign daily targets or specific LeetCode problems.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
            className="px-4 py-2 bg-cream-100 border border-stone-200 text-ink-700 text-sm font-medium rounded-lg hover:bg-cream-200 transition-colors shadow-sm flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import CSV/Excel
          </button>
          <button 
            onClick={() => setIsAssigning(!isAssigning)} 
            className="px-4 py-2 bg-sapphire-800 text-cream-100 text-sm font-medium rounded-lg hover:bg-sapphire-900 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Assign New Task
          </button>
        </div>
      </div>

      {/* Assignment Form */}
      {isAssigning && (
        <div className="bg-cream-100 rounded-xl border border-stone-200/60 p-6 shadow-sm animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-sapphire-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-6 relative">
            <div className="p-2 bg-sapphire-100 text-sapphire-800 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink-900 tracking-tight">Create Assignment</h2>
              <p className="text-xs text-ink-500">Choose between setting target counts or assigning a specific problem.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 relative z-10 p-1 bg-cream-200 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab("TARGET")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "TARGET" ? "bg-cream-100 text-sapphire-800 shadow-sm" : "text-ink-600 hover:text-ink-900"}`}
            >
              <BarChart2 className="w-4 h-4" /> Daily Targets
            </button>
            <button
              onClick={() => setActiveTab("PROBLEM")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "PROBLEM" ? "bg-cream-100 text-sapphire-800 shadow-sm" : "text-ink-600 hover:text-ink-900"}`}
            >
              <Hash className="w-4 h-4" /> Specific Problem
            </button>
          </div>
          
          <form onSubmit={handleAssign} className="relative">
            {activeTab === "TARGET" ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due Date
                  </label>
                  <input 
                    type="date" 
                    value={targetTask.dueDate} 
                    onChange={(e) => setTargetTask({...targetTask, dueDate: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-600/10 transition-all font-medium" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">Easy Target</label>
                  <input 
                    type="number" min="0" 
                    value={targetTask.targetEasy} 
                    onChange={(e) => setTargetTask({...targetTask, targetEasy: parseInt(e.target.value) || 0})} 
                    className="w-full px-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-orange-600 uppercase tracking-wider mb-2">Medium Target</label>
                  <input 
                    type="number" min="0" 
                    value={targetTask.targetMedium} 
                    onChange={(e) => setTargetTask({...targetTask, targetMedium: parseInt(e.target.value) || 0})} 
                    className="w-full px-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-600 uppercase tracking-wider mb-2">Hard Target</label>
                  <input 
                    type="number" min="0" 
                    value={targetTask.targetHard} 
                    onChange={(e) => setTargetTask({...targetTask, targetHard: parseInt(e.target.value) || 0})} 
                    className="w-full px-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-semibold" 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 mb-6">
                {problemTasks.map((pt, idx) => (
                  <div key={idx} className="relative p-5 bg-cream-200/50 border border-stone-200 rounded-xl">
                    {problemTasks.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => {
                          const newTasks = [...problemTasks];
                          newTasks.splice(idx, 1);
                          setProblemTasks(newTasks);
                        }}
                        className="absolute top-3 right-3 p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <h3 className="text-sm font-semibold text-ink-700 mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sapphire-200 text-sapphire-800 text-xs">{idx + 1}</span>
                      Problem Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[12px] font-semibold text-ink-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Search className="w-3.5 h-3.5" /> LeetCode URL
                        </label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Paste LeetCode URL..."
                            value={pt.url || ""} 
                            onChange={(e) => handleUrlFetch(idx, e.target.value)} 
                            className="w-full px-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-600/10 transition-all font-medium shadow-sm pr-10" 
                          />
                          {fetchingUrl === idx && (
                            <Loader2 className="w-4 h-4 text-sapphire-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[12px] font-semibold text-ink-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <AlignLeft className="w-3.5 h-3.5" /> Task Title
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. Two Sum"
                          value={pt.title} 
                          onChange={(e) => {
                            const newTasks = [...problemTasks];
                            newTasks[idx].title = e.target.value;
                            setProblemTasks(newTasks);
                          }} 
                          className="w-full px-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-600/10 transition-all font-medium shadow-sm" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[12px] font-semibold text-ink-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5" /> Problem Number
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. 1"
                          value={pt.leetcodeProblem} 
                          onChange={(e) => {
                            const newTasks = [...problemTasks];
                            newTasks[idx].leetcodeProblem = e.target.value;
                            setProblemTasks(newTasks);
                          }} 
                          className="w-full px-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-600/10 transition-all font-medium shadow-sm" 
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-semibold text-ink-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Difficulty
                        </label>
                        <select
                          value={pt.difficulty}
                          onChange={(e) => {
                            const newTasks = [...problemTasks];
                            newTasks[idx].difficulty = e.target.value;
                            setProblemTasks(newTasks);
                          }}
                          className="w-full px-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-600/10 transition-all font-medium appearance-none shadow-sm"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[12px] font-semibold text-ink-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> Topic
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. Arrays"
                          value={pt.topic} 
                          onChange={(e) => {
                            const newTasks = [...problemTasks];
                            newTasks[idx].topic = e.target.value;
                            setProblemTasks(newTasks);
                          }} 
                          className="w-full px-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-600/10 transition-all font-medium shadow-sm" 
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[12px] font-semibold text-ink-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Due Date
                        </label>
                        <input 
                          type="date" 
                          value={pt.dueDate} 
                          onChange={(e) => {
                            const newTasks = [...problemTasks];
                            newTasks[idx].dueDate = e.target.value;
                            setProblemTasks(newTasks);
                          }} 
                          className="w-full px-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-600/10 transition-all font-medium shadow-sm" 
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => setProblemTasks([...problemTasks, {
                    url: "", title: "", leetcodeProblem: "", difficulty: "Easy", topic: "", dueDate: new Date().toISOString().split('T')[0]
                  }])}
                  className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-sm font-semibold text-ink-500 hover:text-sapphire-800 hover:border-sapphire-300 hover:bg-sapphire-100/50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Another Problem
                </button>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
              <button type="button" onClick={() => setIsAssigning(false)} className="px-5 py-2.5 bg-cream-100 border border-stone-200 text-ink-600 rounded-lg text-sm font-semibold hover:bg-cream-200 hover:text-ink-900 transition-colors shadow-sm">Cancel</button>
              <button disabled={submitting} type="submit" className="px-5 py-2.5 bg-sapphire-800 text-cream-100 rounded-lg text-sm font-semibold hover:bg-sapphire-900 transition-colors shadow-sm shadow-sapphire-800/20 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Publish Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task History Table */}
      <div className="bg-cream-100 rounded-xl border border-stone-200/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-200 bg-cream-200/50 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ink-500" /> Assignment History
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-cream-100 border border-stone-200 rounded-lg text-sm focus:border-sapphire-600 outline-none" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-sapphire-600" /></div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center text-ink-500 text-sm">No tasks assigned yet. Click "Assign New Task" to create one.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-cream-100 border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Type / Details</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Task Info</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {tasks.filter(t => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    (t.title && t.title.toLowerCase().includes(q)) ||
                    (t.taskType && t.taskType.toLowerCase().includes(q)) ||
                    (t.topic && t.topic.toLowerCase().includes(q)) ||
                    (t.difficulty && t.difficulty.toLowerCase().includes(q)) ||
                    (t.leetcodeProblem && String(t.leetcodeProblem).toLowerCase().includes(q))
                  );
                }).map((task) => (
                  <tr key={task.id} className="hover:bg-cream-200/50 transition-colors">
                    <td className="px-5 py-4">
                      {task.taskType === "TARGET" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sapphire-100 text-sapphire-800 border border-sapphire-200">
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
                          <span className="text-sm font-semibold text-ink-900">{task.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-ink-500">#{task.leetcodeProblem}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(task.difficulty)}`}>
                              {task.difficulty}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-ink-700">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-md transition-colors shadow-sm bg-rose-50 border border-rose-100"
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

