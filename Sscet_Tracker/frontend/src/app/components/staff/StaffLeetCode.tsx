import { useState, useEffect } from "react";
import { Code2, Target, Settings2, CheckCircle2, XCircle, ChevronRight, Search } from "lucide-react";
import { getStudents } from "../../services/api";

export default function StaffLeetCode() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Daily Target Configuration
  // Target fetched from Task Management (mocked for now)
  const target = { easy: 3, medium: 2, hard: 1 };

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      // Simulate LeetCode data for assigned students
      const mapped = data.slice(0, 35).map((s: any) => ({
        ...s,
        leetCodeStats: {
          todaySolved: {
            easy: Math.floor(Math.random() * 5),
            medium: Math.floor(Math.random() * 3),
            hard: Math.floor(Math.random() * 2),
          },
          totalSolved: 120 + Math.floor(Math.random() * 200),
          ranking: 100000 + Math.floor(Math.random() * 50000)
        }
      }));
      setStudents(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Code2 className="w-6 h-6 text-orange-500" /> LeetCode Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-1">Set daily targets and monitor LeetCode completion status.</p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2">
          <Target className="w-4 h-4" /> Active Task
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Today's Goal</p>
          <div className="flex gap-3 text-sm font-bold">
            <span className="text-emerald-600">{target.easy} Easy</span>
            <span className="text-orange-600">{target.medium} Med</span>
            <span className="text-rose-600">{target.hard} Hard</span>
          </div>
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

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/60">
              <tr>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Solved</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today's Solved</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Task Status</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const stats = student.leetCodeStats;
                const isCompleted = 
                  stats.todaySolved.easy >= target.easy && 
                  stats.todaySolved.medium >= target.medium && 
                  stats.todaySolved.hard >= target.hard;

                return (
                  <tr key={student.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{student.registerNumber}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-700">{stats.totalSolved}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 text-[11px] font-bold">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">{stats.todaySolved.easy} Easy</span>
                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">{stats.todaySolved.medium} Med</span>
                        <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100">{stats.todaySolved.hard} Hard</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">
                          <XCircle className="w-4 h-4" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a href={student.leetCodeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

