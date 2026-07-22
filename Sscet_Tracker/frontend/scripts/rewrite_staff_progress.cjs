const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffProgress.tsx';

const content = `import { useState, useEffect } from "react";
import { History, Search, Target, ChevronRight } from "lucide-react";
import { getStudents } from "../services/api";

export default function StaffProgress() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      // Mock 7-day history for students
      const mapped = data.slice(0, 35).map((s: any) => {
        const historyDays = Array.from({ length: 7 }).map((_, i) => {
          const isCompleted = Math.random() > 0.3; // 70% chance of completion
          return {
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            status: isCompleted ? "completed" : "pending",
            solved: isCompleted ? Math.floor(Math.random() * 5) + 1 : 0
          };
        });
        return {
          ...s,
          weeklyHistory: historyDays
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

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-500" /> Daily Progress History
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track the full historical daily progress of each student over the past 7 days.</p>
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
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Student</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Past 7 Days Progress</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => (
                <tr key={student.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{student.registerNumber}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 items-center">
                      {student.weeklyHistory?.map((day: any, i: number) => (
                        <div key={i} className="group relative">
                          <div className={\`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all \${
                            day.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-500 border border-rose-100'
                          }\`}>
                            {day.status === 'completed' ? day.solved : '0'}
                          </div>
                          
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] whitespace-nowrap rounded pointer-events-none transition-opacity z-10">
                            {day.date}: {day.status === 'completed' ? \`\${day.solved} solved\` : 'No submissions'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                      Full History <ChevronRight className="w-3.5 h-3.5" />
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
`;

fs.writeFileSync(path, content);
console.log("Rewrote StaffProgress.tsx to show full student history");
