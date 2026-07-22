const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffProgress.tsx';

const content = `import { useState, useEffect } from "react";
import { History, Calendar as CalendarIcon, CheckCircle2, XCircle, Search, User } from "lucide-react";
import { getStudents } from "../services/api";

export default function StaffProgress() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("yesterday");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      // Mock historical data for 35 students
      const mapped = data.slice(0, 35).map((s: any, idx: number) => {
        // Randomly assign completed/pending for yesterday
        const yesterdayCompleted = idx % 3 !== 0; // 2/3rd completed
        const todayCompleted = idx % 2 === 0; // 1/2 completed
        
        return {
          ...s,
          history: {
            "today": {
              target: { easy: 3, medium: 2, hard: 1 },
              completed: todayCompleted,
              solved: todayCompleted ? { easy: 3, medium: 2, hard: 1 } : { easy: 1, medium: 0, hard: 0 }
            },
            "yesterday": {
              target: { easy: 2, medium: 1, hard: 0 },
              completed: yesterdayCompleted,
              solved: yesterdayCompleted ? { easy: 2, medium: 1, hard: 0 } : { easy: 0, medium: 0, hard: 0 }
            }
          }
        };
      });
      setStudents(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentData = filteredStudents.filter(s => s.history && s.history[selectedDate]);
  const completedStudents = currentData.filter(s => s.history[selectedDate].completed);
  const pendingStudents = currentData.filter(s => !s.history[selectedDate].completed);

  const activeTarget = selectedDate === "yesterday" ? { easy: 2, medium: 1, hard: 0 } : { easy: 3, medium: 2, hard: 1 };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-500" /> Daily Progress History
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review historical task completion data for your assigned students.</p>
        </div>
        
        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button 
            onClick={() => setSelectedDate("yesterday")}
            className={\`px-4 py-2 rounded-md text-sm font-medium transition-colors \${selectedDate === "yesterday" ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}
          >
            Yesterday
          </button>
          <button 
            onClick={() => setSelectedDate("today")}
            className={\`px-4 py-2 rounded-md text-sm font-medium transition-colors \${selectedDate === "today" ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Assigned Task</p>
          </div>
          <div className="flex gap-2 text-sm font-bold mt-4">
            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">{activeTarget.easy} Easy</span>
            <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">{activeTarget.medium} Med</span>
            {activeTarget.hard > 0 && <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded border border-rose-100">{activeTarget.hard} Hard</span>}
          </div>
        </div>
        
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-emerald-700 uppercase tracking-wider">Completed</p>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-800">{completedStudents.length}</h2>
          <p className="text-xs text-emerald-600 mt-2 font-medium">Students finished the task</p>
        </div>

        <div className="bg-rose-50/50 rounded-xl border border-rose-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-rose-700 uppercase tracking-wider">Pending (Not Completed)</p>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <h2 className="text-3xl font-bold text-rose-800">{pendingStudents.length}</h2>
          <p className="text-xs text-rose-600 mt-2 font-medium">Students failed to finish</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search students..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/60 text-slate-600 text-sm rounded-lg outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Students Column */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-rose-50/30 flex items-center justify-between">
            <h3 className="font-semibold text-rose-800 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" /> Not Completed
            </h3>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-full">{pendingStudents.length}</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {pendingStudents.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Everyone completed the task!</p>
            ) : (
              pendingStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                      <p className="text-[11px] text-slate-500">{student.registerNumber}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-1 rounded border border-rose-100">Pending</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Students Column */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-emerald-50/30 flex items-center justify-between">
            <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed
            </h3>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{completedStudents.length}</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {completedStudents.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No one completed the task yet.</p>
            ) : (
              completedStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                      <p className="text-[11px] text-slate-500">{student.registerNumber}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
`;

fs.writeFileSync(path, content);
console.log("Created StaffProgress.tsx");
